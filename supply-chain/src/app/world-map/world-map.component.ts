/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  Component,
  Input,
  ViewChild,
  OnChanges,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  SimpleChanges, OnDestroy
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import geojsonvt from 'geojson-vt';
import { Map, View, Overlay, VectorTile, Collection } from 'ol';
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

import { NodeProperties } from './world-map.model';

@Component({
  selector: 'vmw-sc-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  // Takes GeoJSON FeatureCollection of Points as input.  Each feature should have properties that conform to NodeProperties.
  @Input('features') features;

  @ViewChild('mapContainer') mapContainer;
  @ViewChild('tooltipContainer') tooltipContainer;

  // The map and its map's tooltip/overlay layer
  private map;
  private overlay;

  // The pulse animation duration and its interval
  private animationDuration = 3000;
  private animationInterval;

  // The current node properties used to generate the overlay/tooltip
  nodeProperties: NodeProperties;

  // An observable collection of features for the map
  private featureCollection = new Collection();

  constructor(private http: HttpClient, private ref: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.features) {
      this.featureCollection.clear();
      this.featureCollection.extend(new GeoJSON().readFeatures(changes.features.currentValue, {
        dataProjection: null,
        featureProjection: getProjection('EPSG:3857')
      }));
    }
  }

  ngOnDestroy(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  private initMap() {
    const tilePixels = new Projection({
      code: 'TILE_PIXELS',
      units: 'tile-pixels'
    });

    // Styles for the country layer - same fill and stroke for flat earth look
    const countryStyle = new Style({
      fill: new Fill({
        color: '#204454'
      }),
      stroke: new Stroke({
        color: '#204454',
        width: 1
      })
    });
    // Fill color for feature bubbles
    const nodeFeatureFill = new Fill({color: '#00ffffaa'});
    const nodeFeatureFillSelected = new Fill({color: '#00ffff'});

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

    // A layer to hold the nodes
    const nodeFeatureLayer = new VectorLayer({
      source: new VectorSource({
        wrapX: false,
        features: this.featureCollection
      }),
      style: nodeFeatureStyle(nodeFeatureFill)
    });

    // Set up a hover interaction with the node layer to show the overlay/tooltip
    const nodeFeatureHoverInteraction = new Select({
      wrapX: false,
      layers: [nodeFeatureLayer],
      condition: pointerMove,
      style: nodeFeatureStyle(nodeFeatureFillSelected)
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

    this.map = new Map({
      layers: [nodeFeatureLayer],
      overlays: [this.overlay],
      target: this.mapContainer.nativeElement,
      view: new View({
        center: fromLonLat([0, 30]),
        zoom: 2.75,
        zoomFactor: 1.75
      }),
      interactions: interactionDefaults({mouseWheelZoom: false})
    });
    this.map.addInteraction(nodeFeatureHoverInteraction);

    // Set up pulsing animation on map features
    this.checkAndSchedulePulseAnimation();
    this.animationInterval = setInterval(this.checkAndSchedulePulseAnimation.bind(this), this.animationDuration + 1000);

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
    });
  }

  /**
   * Unset various properties to hide the active hovered tooltip/overlay
   */
  onLeaveTooltip() {
    this.nodeProperties = undefined;
    this.overlay.setPosition(undefined);
  }

  /**
   * Checks for any deploying nodes and schedules their animation. Meant to be called on an interval.
   */
  private checkAndSchedulePulseAnimation() {
    this.featureCollection.forEach(feature => {
      const isDeploying = (feature.getProperties() as NodeProperties).nodes.filter(node => node.status === 'Deploying');
      if (isDeploying.length > 0) {
        this.startPulseAnimation(feature);
      }
    });
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
      const originalRadius = (feature.getProperties() as NodeProperties).nodes.length * 10;
      const radius = originalRadius + easeOut(elapsedRatio) * originalRadius * 0.5;
      // Get opacity range based on elapsed time and convert to hex
      let opacity = clamp(Math.floor(easeOut(1 - elapsedRatio) * maxOpacity), minOpacity, maxOpacity).toString(16);
      // Opacity in hex format must have 2 characters so pad with 0 if needed;
      if (opacity.length === 1) {
        opacity = `0${opacity}`;
      }
      const style = new Style({
        image: new Circle({
          radius: radius,
          snapToPixel: false,
          stroke: new Stroke({
            color: `#00ffff${opacity}`,
            width: 1
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
    this.map.render();
  }
}

/**
 * Clamp a given number between two given ranges
 *
 * @param {number} value The value to clamp
 * @param {number} min The smallest value
 * @param {number} max The largest value
 * @returns {number} A value within the range of min and max
 */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * An ol.style.Style generating function. Needs to be generated per node to show difference in size according to how
 * many nodes at the location.
 *
 * @param fill ol.style.Fill A
 * @returns {(feature) => ol.style.Style} A per-node generating style function
 */
function nodeFeatureStyle(fill) {
  return function(feature) {
    const nodeCount = (feature.getProperties() as NodeProperties).nodes.length;
    const unhealthyNodes = (feature.getProperties() as NodeProperties).nodes.filter(node => node.status === 'Unhealthy').length > 0;
    return new Style({
      image: new Circle({
        fill,
        stroke: unhealthyNodes ? new Stroke({
          color: '#e62700aa',
          width: 3
        }) : null,
        radius: nodeCount * 10
      })
    });
  };
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
