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
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorAlertService } from '../shared/global-alert.service';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { Order } from '../core/order/order';
import { UserService } from '../core/user/user.service';
import { NotifierService } from '../shared/notifier.service';
import { BlockchainVisualizationComponent } from './blockchain-visualization/blockchain-visualization.component';

@Component({
  selector: 'vmw-sc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy, OnInit {
  @ViewChild('nodes') nodes: BlockchainVisualizationComponent;
  createOrderVisible = false;
  currentUser: any;
  alerts: any[] = [];
  _selectedOrder: Order;
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
    private router: Router,
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

  }

  ngOnInit() {
    this.updatedOrderRef = this.blockchainService.updatedOrder.subscribe((order) => {
      if (this.selectedOrder.id === order.id) {
        this.selectedOrder = order;
      }
    });
  }

  onClose() {
    this.router.navigate([''], { fragment: null });
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
    this.nodes.update(notification);
  }

}
