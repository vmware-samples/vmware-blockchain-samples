/*
 * Copyright 2018-2021 VMware, all rights reserved.
 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import '@cds/core/icon/register.js';
import {
  ClarityIcons, viewListIcon, cogIcon, blocksGroupIcon,
  vmIcon, dashboardIcon, refreshIcon, helpIcon, pencilIcon,
  recycleIcon, userIcon, fileGroupIcon, successStandardIcon,
} from '@cds/core/icon';
import { Router } from '@angular/router';
import { DigitalArtsService } from './main/digital-arts.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ClrForm, ClrInput } from '@clr/angular';
import { Subscription } from 'rxjs';

ClarityIcons.addIcons(
  blocksGroupIcon,
  cogIcon,
  viewListIcon,
  dashboardIcon,
  vmIcon,
  helpIcon,
  refreshIcon,
  pencilIcon,
  recycleIcon,
  userIcon,
  fileGroupIcon,
  successStandardIcon,
);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'Artemis';
  contractAddressErrorMessage = '';
  contractSub: Subscription;
  addressForm: FormGroup;
  @ViewChild(ClrInput, {static: true}) clrInput: ClrInput;
  @ViewChild(ClrForm, {static: true}) clrForm: ClrForm;

  deploymentResultModalShown = false;
  deploymentResultModalMessage = '';
  deploymentResultModalData = '';
  deploymentResultHasError = false;

  //magic numbers
  deploymentMessageJsonIndentSpaces = 4;

  constructor(
    public digitalArtsService: DigitalArtsService,
    private router: Router,
  ) {
    this.contractSub = this.digitalArtsService.mainContract$.subscribe(contract => {
      this.clrForm.markAsTouched();
      if (this.digitalArtsService.mainContractStatus === 'NOT_FOUND') {
        this.contractAddressErrorMessage = 'Contract Not Found';
      } else if (this.digitalArtsService.mainContractStatus === 'BAD_ADDRESS') {
        this.contractAddressErrorMessage = 'Bad Address (must be 42 characters starting with 0x)';
      }
    });
    this.addressForm = new FormGroup({
      address: new FormControl(
        this.digitalArtsService.mainContractAddress,
        { validators: [this.getFormValidator()], updateOn: 'blur' },
      ),
    });
  }
  
  goHome() {
    this.router.navigate([`/digital-arts`]);
  }

  async deployNewNftContract() {
    let result;
    try{
      result = await this.digitalArtsService.deployNewNftContract();
      this.deploymentResultModalMessage = 'Contract deployed successfully at ' + this.digitalArtsService.mainContractAddress;
      this.deploymentResultHasError = false;
      this.deploymentResultModalData = JSON.stringify(result, null, this.deploymentMessageJsonIndentSpaces);
      this.deploymentResultModalShown = true;
    } catch(error) {
      if (error.code) {
        switch(error.code) {
          case "ACTION_REJECTED":
            this.deploymentResultModalMessage = "User cancelled transaction before signing";
            break;
          case -32603:
            // Todo: Extract the message from a json inside e
            if(error.message.includes('Permission denied')){
              this.deploymentResultModalMessage = 'Deployment failed due to lack of permissions';
            } else {
              this.deploymentResultModalMessage = 'Deployment failed due to other reasons';
            }
            break;
          default:
            this.deploymentResultModalMessage = 'Deployment failed';
            break;
        }
      } else {
        this.deploymentResultModalMessage = 'Deployment failed because of following error';
      }

      this.deploymentResultHasError = true;
      this.deploymentResultModalShown = true;
      this.deploymentResultModalData = JSON.stringify(error, null, this.deploymentMessageJsonIndentSpaces);
    }
  }

  ngOnInit() {
    
  }

  ngOnDestroy() {
    if (this.contractSub) {
      this.contractSub.unsubscribe();
    }
  }

  smartContractAddressChange(e) {
    this.digitalArtsService.refreshContractAddress(e.target.value);
  }

  smartContractAddressFlush(e) {
    // this.digitalArtsService.refreshContractAddress(e.target.value);
  }

  changeAutoRefreshInterval(interval) {
    // const numInterval = Number(interval);
    // if ( numInterval === 1) {
    //   this.interval = `IN ${interval} SECOND`;
    //   this.ethService.setAutoRefreshInterval(numInterval);
    // } else if (numInterval > 1) {
    //   this.interval = `IN ${interval} SECONDS`;
    //   this.ethService.setAutoRefreshInterval(numInterval);
    // } else {
    //   this.interval = `DISABLED`;
    //   this.ethService.setAutoRefreshInterval(0);
    // }
  }

  clearCache():void {
    // this.ethService.clearCache();
  }

  getFormValidator(): ValidatorFn {
    const self = this;
    return (control:AbstractControl) : ValidationErrors | null => {
        const bad = self.digitalArtsService.mainContractStatus === 'NOT_FOUND' ||
                    self.digitalArtsService.mainContractStatus === 'BAD_ADDRESS';
        return bad ? { errorCode: self.digitalArtsService.mainContractStatus }: null;
    }
  }
}
