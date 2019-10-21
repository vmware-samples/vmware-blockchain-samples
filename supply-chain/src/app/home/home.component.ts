/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { ErrorAlertService } from '../shared/global-alert.service';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { Order } from '../order/shared/order';
import { UserService } from '../core/user/user.service';
import { NotifierService } from '../shared/notifier.service';
import { WorldMapComponent } from '../world-map/world-map.component';

import { environment } from '../../environments/environment';

@Component({
  selector: 'vmw-sc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('worldMap') worldMap: WorldMapComponent;
  createOrderVisible = false;
  currentUser: any;
  alerts: any[] = [];
  _selectedOrder: Order;
  nodes: any[];
  orderTracking: any[];
  transaction: string;
  private updatedOrderRef: Subscription;

  get selectedOrder() {
    return this._selectedOrder;
  }

  set selectedOrder(value) {
    this._selectedOrder = value;
  }

  constructor(
    private blockchainService: BlockchainService,
    private route: ActivatedRoute,
    public zone: NgZone,
    private alertService: ErrorAlertService,
    private notifierService: NotifierService,
    userService: UserService
  ) {
    this.currentUser = userService.currentUser;
    this.route.fragment.subscribe((fragment: string) => {
      this.createOrderVisible = (fragment === 'create');
    });

    this.alertService.notify
      .subscribe(error => this.addAlert(error));

    this.notifierService.notify
      .subscribe(notfication => this.update(notfication));

    this.route.firstChild.params.subscribe(params => {
      const orderId = params['order_id'];
      const web3 = this.blockchainService.web3;
      if (orderId && web3.isAddress(orderId)) {
        this.blockchainService.getOrderByAddress(orderId).then(order => {
          this.blockchainService.getLocations(order).then(locations => {
            this.worldMap.syncLocations(locations);
          });
        });
      }
    });
  }

  ngOnInit() {
    this.updatedOrderRef = this.blockchainService.updatedOrder.subscribe((order) => {
      const previousOrder = this.selectedOrder;

      this.selectedOrder = order;
      this.blockchainService.getLocations(order).then(locations => {
        this.worldMap.syncLocations(locations);
      });

      if (order['where'] === 'sendOrder') {
        this.worldMap.nodeConsensus();
      }
    });
  }

  ngAfterViewInit() {
    if (environment.blockchainType === 'vmware') {
      this.setNodes();

    }
  }

  ngOnDestroy() {
    this.updatedOrderRef.unsubscribe();
  }

  private addAlert(alert: any): void {
    if (alert) {
      const alertItem = {
        message: String(alert)
      };

      this.zone.run(() => this.alerts.push(alertItem));
    }
  }

  private update(notification: any): void {
    if (!notification) { return; }
    this.transaction = notification;
  }

  private setNodes() {
    this.blockchainService.getNodes().subscribe(nodes => {
      this.nodes = nodes.nodesByLocation;
    });
  }

}
