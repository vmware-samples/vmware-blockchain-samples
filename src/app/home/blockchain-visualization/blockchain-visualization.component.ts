/*
 * Copyright 2019 VMware, all rights reserved.
 */

import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BlockchainStatusCardComponent } from '../blockchain-status/blockchain-status-card.component';
import { UserService } from '../../core/user/user.service';
import { random } from '../../shared/utils';

@Component({
  selector: 'vmw-sc-blockchain-visualization',
  templateUrl: './blockchain-visualization.component.html',
  styleUrls: ['./blockchain-visualization.component.scss']
})
export class BlockchainVisualizationComponent implements AfterViewInit, OnInit {
  @ViewChild('linesSvg') svg: ElementRef;
  @ViewChildren(BlockchainStatusCardComponent, {read: ElementRef}) cards: QueryList<ElementRef>;

  roles: string[];
  statuses: string[];
  paths: Array<{ id: string, route: string }> = [];

  constructor(userService: UserService) {
    // TODO - get the roles from back end
    this.roles = userService.roles.slice(0, 4);
    this.statuses = Array(4).fill('healthy');
    this.statuses[random(4) - 1] = 'healthy-check';
  }

  ngOnInit() {}

  ngAfterViewInit() {
    // Set up lines between cards
    this.drawPaths();
  }

  drawPaths() {
    this.cards.forEach((currentCard, currentCardIndex) => {
      this.cards.forEach((targetCard, targetCardIndex) => {
        if (currentCardIndex !== targetCardIndex) {
          const invertPath = (targetCardIndex < currentCardIndex);
          this.paths.push({
            id: `path-${currentCardIndex}-${targetCardIndex}`,
            route: this.pathBetween(currentCard, targetCard, invertPath)
          });
        }
      });
    });
  }

  onResize(event) {
    this.paths = [];
    this.drawPaths();
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
}
