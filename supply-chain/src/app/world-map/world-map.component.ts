/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  OnChanges,
  HostListener,
  SimpleChanges
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import geojsonvt from 'geojson-vt';
import { Map, View, Overlay, VectorTile, Collection } from 'ol';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString.js';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import { Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import { get as getProjection, fromLonLat } from 'ol/proj';
import Projection from 'ol/proj/Projection';
import Select from 'ol/interaction/Select';
import GeoJSON from 'ol/format/GeoJSON';
import { pointerMove } from 'ol/events/condition';
import { getCenter } from 'ol/extent';
import { defaults as interactionDefaults } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import { easeOut } from 'ol/easing';
import { addCommon as addCommonProjections } from 'ol/proj.js';

import { NodeProperties } from './world-map.model';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { Order } from '../core/order/order';


@Component({
  selector: 'vmw-sc-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input('nodes') nodes;
  @Input('orderTracking') orderTracking;
  // Takes GeoJSON FeatureCollection of Points as input.  Each feature should have properties that conform to NodeProperties.
  order: Order;

  @ViewChild('mapContainer') mapContainer;
  @ViewChild('tooltipContainer') tooltipContainer;

  // The map and its map's tooltip/overlay layer
  private map: Map;
  private overlay: Overlay;
  private view: View;
  private vectorSource: VectorSource;

  // The pulse animation duration and its interval
  private animationDuration = 1400;
  private animationInterval;

  // The current node properties used to generate the overlay/tooltip
  nodeProperties: NodeProperties;

  // An observable collection of features for the map
  private featureCollection = new Collection();
  private ordersTracking: VectorSource;
  private ordersPoint: Collection = new Collection;
  private locations: any[] = [];

  theme = {
    countryFill: '#ECEAE6',
    countryBorder: '#ECEAE6', // #DCDBD8
    nodeFill: '#60B515',
    unhealthyNode: '#4CB344',
    nodeFillSelected: '#00ffff',
    nodeAnimation: '#4CB344',
    trackingPath: '#669DF6',
    trackingPathBorder: '#1967D2'
  };

  constructor(
    private http: HttpClient,
    private ref: ChangeDetectorRef,
    private blockchainService: BlockchainService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.nodes && changes.nodes.currentValue) {
      this.featureCollection.clear();

      changes.nodes.currentValue.forEach(cluster => {
        const feature = new Feature(new Point(fromLonLat(cluster.geo)));
        feature.setProperties(cluster);
        this.featureCollection.push(feature);
      });
    }
  }

  ngAfterViewInit() {
    // This is a patch for an angular build issue
    // https://github.com/openlayers/openlayers/issues/9019#issuecomment-444441291
    addCommonProjections();

    this.initMap();
    this.initOrderLocationLayer();
  }

  ngOnDestroy(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.viewFit();
  }

  setOrder(order: Order) {
    this.order = order;
  }

  private initMap() {
    const tilePixels = new Projection({
      code: 'TILE_PIXELS',
      units: 'tile-pixels'
    });

    // Styles for the country layer - same fill and stroke for flat earth look
    const countryStyle = new Style({
      fill: new Fill({
        color: this.theme.countryFill
      }),
      stroke: new Stroke({
        color: this.theme.countryBorder,
        width: 1
      })
    });
    // Fill color for feature bubbles
    const nodeFeatureFill = new Fill({ color: this.theme.nodeFill });
    const nodeFeatureFillSelected = new Fill({ color: this.theme.nodeFill });

    // Overlay container for the tooltip on node hover
    this.overlay = new Overlay({
      element: this.tooltipContainer.nativeElement,
      positioning: 'right',
      autoPan: true,
      autoPanAnimation: {
        source: null,
        duration: 250
      }
    });

    this.vectorSource = new VectorSource({
      wrapX: false,
      features: this.featureCollection
    });
    // A layer to hold the nodes
    const nodeFeatureLayer = new VectorLayer({
      source: this.vectorSource,
      style: this.nodeFeatureStyle(nodeFeatureFill)
    });

    // Set up a hover interaction with the node layer to show the overlay/tooltip
    const nodeFeatureHoverInteraction = new Select({
      wrapX: false,
      layers: [nodeFeatureLayer],
      condition: pointerMove,
      style: this.nodeFeatureStyle(nodeFeatureFillSelected)
    });

    nodeFeatureHoverInteraction.on('select', (event: any) => {
      if (event.selected.length > 0) {
        // On hover of a node, store the data from the GeoJSON properties object and show the overlay popup
        const feature = event.selected[0];
        this.nodeProperties = feature.getProperties();
        const extent = event.selected[0].getGeometry().getExtent();
        const center = getCenter(extent);
        this.overlay.setPosition(center);
      }
      this.ref.markForCheck();
    });

    this.view = new View();

    this.map = new Map({
      layers: [nodeFeatureLayer],
      overlays: [this.overlay],
      target: this.mapContainer.nativeElement,
      view: this.view,
      interactions: interactionDefaults({ mouseWheelZoom: false })
    });
    this.map.addInteraction(nodeFeatureHoverInteraction);

    // Fetch and set up GeoJSON backed country layer
    this.http.get('assets/countries-110m.json').subscribe(result => {
      // Convert GeoJSON source to vector tiles
      const tileSource = geojsonvt(result, {
        extent: 4096,
        debug: 0
      });

      // A layer to hold the world map
      const countryOutlineLayer = new VectorTileLayer({
        source: new VectorTileSource({
          format: new GeoJSON(),
          wrapX: false,
          tileLoadFunction: function(tile: VectorTile) {
            const format = tile.getFormat();
            const tileCoord = tile.getTileCoord();
            // Grab the desired tile from the geojsonvt vector tile source
            const data = tileSource.getTile(tileCoord[0], tileCoord[1], -tileCoord[2] - 1);
            // Convert it to GeoGSON
            const features = format.readFeatures({
              type: 'FeatureCollection',
              features: (data.features || []).map(vectorTileFeatureToGeoJsonFeature)
            });
            tile.setLoader(function() {
              tile.setFeatures(features);
              tile.setProjection(tilePixels);
            });
          },
          url: 'data:', // Fake a URL, otherwise tileLoadFunction won't be called
          projection: null
        }),
        style: countryStyle
      });

      // Insert this layer behind all other layers
      this.map.getLayers().insertAt(0, countryOutlineLayer);
      this.map.updateSize();
      this.viewFit();
    });
  }

  /**
   * Unset various properties to hide the active hovered tooltip/overlay
   */
  onLeaveTooltip() {
    this.nodeProperties = undefined;
    this.overlay.setPosition(undefined);
  }

  nodeConsensus() {
    this.featureCollection.forEach(
      feature => this.startPulseAnimation(feature)
    );
  }

  /**
   * Performs a pulsing animation on a single node feature
   */
  private startPulseAnimation(feature) {
    const start = new Date().getTime();
    const listenerKey = this.map.on('postcompose', (event) => {
      const minOpacity = 0;
      const maxOpacity = 255;
      const vectorContext = event.vectorContext;
      const frameState = event.frameState;
      const flashGeom = feature.getGeometry().clone();
      const elapsed = frameState.time - start;
      const elapsedRatio = elapsed / this.animationDuration;
      const originalRadius = 10;
      const radius = originalRadius + easeOut(elapsedRatio) * originalRadius * 1;
      // Get opacity range based on elapsed time and convert to hex
      let opacity = this.clamp(Math.floor(easeOut(1 - elapsedRatio) * maxOpacity), minOpacity, maxOpacity).toString(16);
      // Opacity in hex format must have 2 characters so pad with 0 if needed;
      if (opacity.length === 1) {
        opacity = `0${opacity}`;
      }
      const style = new Style({
        image: new Circle({
          radius: radius,
          snapToPixel: false,
          stroke: new Stroke({
            color: `${this.theme.nodeAnimation}${opacity}`,
            width: 2
          })
        })
      });

      vectorContext.setStyle(style);
      vectorContext.drawGeometry(flashGeom);
      if (elapsed > this.animationDuration) {
        unByKey(listenerKey);
        return;
      }
      this.map.render();
    });
  }

  syncLocations(orderLocations: any[], newOrder: boolean = false) {
    this.ordersTracking.clear();
    // this.ordersPoint.clear();
    orderLocations.forEach((loc, i) => this.addLocation(orderLocations, loc, i));
  }

  addLocation(loc: any[], to: number[], idx: number = 0) {
    const point = new Feature(new Point(fromLonLat(to)));
    this.ordersPoint.push(point);

    if (idx !== 0) {
      const from = loc[idx - 1];
      const line = new LineString([fromLonLat(from), fromLonLat(to)]);
      const feature = new Feature({
        geometry: line,
        lonLat: to
      });
      this.ordersTracking.addFeature(feature);
    }
  }

  private initOrderLocationLayer() {
    const style = [new Style({
      stroke: new Stroke({
        color: this.theme.trackingPath,
        width: 1
      })
    }), new Style({
      stroke: new Stroke({
        color: this.theme.trackingPathBorder,
        width: 3
      })
    })];

    const pointFill = new Fill({ color: this.theme.unhealthyNode });
    const pointStyle = new Style({
      image: new Circle({
        pointFill,
        radius: 6
      })
    });

    this.ordersTracking = new VectorSource({
      wrapX: false,
    });

    const trackingLayer = new VectorLayer({
      source: this.ordersTracking,
      style: style
    });

    const orderPointSource = new VectorSource({
      wrapX: false,
      features: this.ordersPoint,
    });

    const pointLayer = new VectorLayer({
      source: orderPointSource,
      style: pointStyle
    });

    this.map.addLayer(pointLayer);
    this.map.addLayer(trackingLayer);
    this.map.render();
    // this.map.on('postcompose', this.animateOrders.bind(this));
  }

  private animateOrders(event): void {
    const pointsPerMs = 0.1;
    const vectorContext = event.vectorContext;
    const frameState = event.frameState;
    const features = this.ordersTracking.getFeatures();
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      if (!feature.get('finished')) {
        // only draw the lines for which the animation has not finished yet
        const coords = feature.getGeometry().getCoordinates();
        const elapsedTime = 40000;

        const maxIndex = Math.min(elapsedTime, coords.length);
        const currentLine = new LineString(coords.slice(0, maxIndex));

        // directly draw the line with the vector context
        vectorContext.drawGeometry(currentLine);
      }
    }
    // tell OpenLayers to continue the animation
    this.map.render();
  }


  private viewFit() {
    this.view.fit(
      this.vectorSource.getExtent(),
      { padding: [30, 60, 30, 40], constrainResolution: false }
    );
  }

  /**
   * Clamp a given number between two given ranges
   *
   * @param {number} value The value to clamp
   * @param {number} min The smallest value
   * @param {number} max The largest value
   * @returns {number} A value within the range of min and max
   */
  private clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * An ol.style.Style generating function. Needs to be generated per node to show difference in size according to how
   * many nodes at the location.
   *
   * @param fill ol.style.Fill A
   * @returns {(feature) => ol.style.Style} A per-node generating style function
   */
  private nodeFeatureStyle(fill) {
    return (feature) => {
      const nodeCount = (feature.getProperties() as NodeProperties).nodes.length;
      const unhealthyNodes = (feature.getProperties() as NodeProperties).nodes.filter(node => node.status === 'Unhealthy').length > 0;
      return new Style({
        image: new Circle({
          fill,
          stroke: unhealthyNodes ? new Stroke({
            color: this.theme.unhealthyNode,
            width: 3
          }) : null,
          radius: 6
        })
      });
    };
  }


}

  /**
   * Convert a VectorTile feature to a GeoJSON feature
   * Adapted from https://openlayers.org/en/latest/examples/geojson-vt.html
   *
   * @param feature A VectorTile feature
   * @returns a GeoJSON feature
   */
  function vectorTileFeatureToGeoJsonFeature(feature) {
    let type;
    let coordinates = feature.geometry;

    if (feature.type === 1) {
      type = 'MultiPoint';
      if (coordinates.length === 1) {
        type = 'Point';
        coordinates = coordinates[0];
      }
    } else if (feature.type === 2) {
      type = 'MultiLineString';
      if (coordinates.length === 1) {
        type = 'LineString';
        coordinates = coordinates[0];
      }
    } else if (feature.type === 3) {
      type = 'Polygon';
      if (coordinates.length > 1) {
        type = 'MultiPolygon';
        coordinates = [coordinates];
      }
    }

    return {
      type: 'Feature',
      geometry: {
        type,
        coordinates
      }
    };
  }


