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
import { Order } from '../core/order/order';
import { UserService } from '../core/user/user.service';
import { NotifierService } from '../shared/notifier.service';
import { WorldMapComponent } from '../world-map/world-map.component';

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

  ngOnDestroy() {
    this.updatedOrderRef.unsubscribe();
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

    this.blockchainService.notify
      .subscribe(notfication => this.process(notfication));
  }

  ngOnInit() {
    this.updatedOrderRef = this.blockchainService.updatedOrder.subscribe((order) => {
      this.selectedOrder = order;
      this.worldMap.setOrder(order);
    });
  }

  ngAfterViewInit() {
    this.setNodes();
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

  private process(notification: any): void {
    if (!notification) { return; }

    switch (notification.type) {
      case 'locationUpdate':
        this.worldMap.addLocation(notification.value, notification.value);
        break;

      default:
        // code...
        break;
    }
  }

}
