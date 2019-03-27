/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Component, OnDestroy, Input, OnInit, ViewChild } from '@angular/core';
import { ClrWizard } from '@clr/angular';
import { interval } from 'rxjs';
import { BlockchainService } from '../../core/blockchain/blockchain.service';
import { UserService } from '../../core/user/user.service';

@Component({
  selector: 'vmw-sc-onboarding-wizard',
  templateUrl: './onboarding-wizard.component.html',
  styleUrls: ['./onboarding-wizard.component.scss']
})
export class OnboardingWizardComponent implements OnDestroy, OnInit {
  @ViewChild(ClrWizard) wizard;

  @Input() open = false;
  timerSubscription;
  userTimerComplete = true;

  private roleOrder = [ this.userService.ROLE_SUPER_MARKET,
                        this.userService.ROLE_FARMER,
                        this.userService.ROLE_AUDITOR,
                        this.userService.ROLE_STORAGE,
                        this.userService.ROLE_DISTRIBUTOR ];

  role = this.roleOrder[0];

  constructor( private blockchainService: BlockchainService,
               private userService: UserService ) { }

  ngOnDestroy() {
    this.cancelTimer();
  }

  ngOnInit() {
  }

  finish() {
    this.blockchainService.createOrder(this.blockchainService.items[0], 100).then( () => this.open = false );
  }

  pageChanged() {
    if (this.wizard.currentPage.id === 'clr-wizard-page-2') {
      this.userTimerComplete = false;
      this.cancelTimer();
      const userTimer = interval(1000);
      this.timerSubscription = userTimer.subscribe(t => {
        if ( t >= 60 ) {
          this.userTimerComplete = true;
          this.cancelTimer();
        }
      });
    }
  }

  roleTranslation() {
    return { role: this.role };
  }

  private cancelTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerSubscription = null;
  }

}
