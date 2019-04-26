/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  Input
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { BlockchainNode, BlockchainNodeTransactionStates } from '../core/blockchain/blockchain-node';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { UserService } from '../core/user/user.service';
import { NotifierService } from '../shared/notifier.service';
import { random } from '../shared/utils';
import { BlockchainVisualizationCardComponent } from './blockchain-visualization-card.component';

@Component({
  selector: 'vmw-sc-blockchain-visualization',
  templateUrl: './blockchain-visualization.component.html',
  styleUrls: ['./blockchain-visualization.component.scss']
})
export class BlockchainVisualizationComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChildren('animations') animations: QueryList<ElementRef>;
  @ViewChild('linesSvg') svg: ElementRef;
  @ViewChildren(BlockchainVisualizationCardComponent, {read: ElementRef}) cards: QueryList<ElementRef>;

  readonly NODE_COMPLETION_RESET_TIME = 5000;
  readonly NODE_REFRESH_PERIOD = 30000;
  readonly TRANSACTION_CHECK_INTERVAL = 3000;

  animationPaths: Array<{ id: string, route?: string }> = [];
  nodes: BlockchainNode[] = [];
  paths: Array<{ id: string, healthy: boolean, route: string }> = [];
  roles: string[];
  showAnimations = false;

  private newOrderRef: Subscription;
  private refreshNodesSubscription: Subscription;
  private transactionSubscription: Subscription;

  constructor(
    private blockchainService: BlockchainService,
    private notifierService: NotifierService,
    private userService: UserService
  ) {
    // TODO - get the roles from back end
    this.roles = userService.roles.slice(0, 4);
    this.animationPaths = Array.from(Array(4)).map((_, i) => {
      return { id: `circle-${i}` };
    });
    this.notifierService.notify
      .subscribe(notfication => this.showTransaction(notfication));
  }

  ngOnDestroy() {
    this.newOrderRef.unsubscribe();
    this.refreshNodesSubscription.unsubscribe();
    this.cancelTransactionSubscription();
  }

  ngOnInit() {
    this.newOrderRef = this.blockchainService.newOrder.subscribe((address) => {
      this.showTransaction(address);
    });
  }

  ngAfterViewInit() {
    // Set up lines between cards
    this.refreshNodesSubscription = timer(0, this.NODE_REFRESH_PERIOD).subscribe(() => this.refreshNodes());
  }

  drawPaths() {
    this.nodes.forEach((currentNode, currentNodeIndex) => {
      this.nodes.forEach((targetNode, targetNodeIndex) => {
        if (currentNodeIndex !== targetNodeIndex) {
          const healthy = (currentNode.status === 'live' && targetNode.status === 'live');
          const invertPath = (targetNodeIndex < currentNodeIndex);
          const cardArray = this.cards.toArray();
          this.paths.push({
            healthy: healthy,
            id: `path-${currentNodeIndex}-${targetNodeIndex}`,
            route: this.pathBetween(cardArray[currentNodeIndex], cardArray[targetNodeIndex], invertPath)
          });
        }
      });
    });
  }

  async refreshNodes() {
    // TODO: Possibly handle new nodes or nodes going missing?
    const latestNodes = await this.blockchainService.getMembers();
    if (this.nodes.length) {
      latestNodes.forEach((node) => {
        const match = this.nodes.find((n) => n.hostname === node.hostname);
        match.status = node.status;
      });
    } else {
      this.nodes = latestNodes;
      this.nodes.map(node => node.transactionState = BlockchainNodeTransactionStates.healthy);
      this.nodes = this.nodes.sort((a, b) => a.hostname.localeCompare(b.hostname));
    }
    this.drawPaths();
  }

  onResize(event) {
    this.paths = [];
    this.drawPaths();
  }

  showTransaction(address: string) {
    if (!address) { return null; }
    this.cancelTransactionSubscription(); // In case already subscribed
    this.playAnimations();

    this.transactionSubscription = timer(this.TRANSACTION_CHECK_INTERVAL, this.TRANSACTION_CHECK_INTERVAL).subscribe(() => {
      this.blockchainService.getReceipt(address).then((response) => {
        this.cancelTransactionSubscription();
        this.nodes.map(node => node.transactionState = BlockchainNodeTransactionStates.approved);
        timer(this.NODE_COMPLETION_RESET_TIME).subscribe(() => {
          this.nodes.map(node => node.transactionState = BlockchainNodeTransactionStates.healthy);
        });
      }, (error) => {
        // ignore for now
      });
    });
  }

  private cancelTransactionSubscription() {
    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
      this.transactionSubscription = null;
    }
  }

  // TODO: Consider supporting different pathing algorithms for different node counts
  private pathBetween(div1: ElementRef, div2: ElementRef, invertPath: boolean = false) {
    // Use offset of parent svg because translateX/translateY makes the nativeElement.left/top wrong
    const offsetX = this.svg.nativeElement.getBoundingClientRect().left;
    const offsetY = this.svg.nativeElement.getBoundingClientRect().top;
    const x1 = div1.nativeElement.getBoundingClientRect().left - offsetX + (div1.nativeElement.offsetWidth / 2);
    const y1 = div1.nativeElement.getBoundingClientRect().top - offsetY + (div1.nativeElement.offsetHeight / 2);
    const x2 = div2.nativeElement.getBoundingClientRect().left - offsetX + (div2.nativeElement.offsetWidth / 2);
    const y2 = div2.nativeElement.getBoundingClientRect().top - offsetY + (div2.nativeElement.offsetHeight / 2);
    if (invertPath) {
      return `M${x1} ${y1} H ${x2} V ${y2}`;
    } else {
      return `M${x1} ${y1} V ${y2} H ${x2}`;
    }
  }

  private playAnimations() {
    this.nodes[0].transactionState = BlockchainNodeTransactionStates.approved;
    const cardArray = this.cards.toArray();
    this.showAnimations = true;
    this.animationPaths.map((path, i) => {
      this.animationPaths[i].route = this.pathBetween(cardArray[0], cardArray[i]);
      const node = document.getElementById(`circle-${i}`) as any;
      node.beginElement();
      timer(this.TRANSACTION_CHECK_INTERVAL).subscribe(() => this.showAnimations = false );
    });
  }
}
