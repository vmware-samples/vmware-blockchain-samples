/*
 * Copyright 2018-2021 VMware, all rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { EthService } from './eth/eth.service';
import '@cds/core/icon/register.js';
import { ClarityIcons, userIcon, cogIcon, blocksGroupIcon, vmIcon, administratorIcon } from '@cds/core/icon';

ClarityIcons.addIcons(blocksGroupIcon);
ClarityIcons.addIcons(cogIcon);
ClarityIcons.addIcons(userIcon);
ClarityIcons.addIcons(administratorIcon);
ClarityIcons.addIcons(vmIcon);
import {ethers} from 'ethers';

declare let window: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'permissioning';
  web3: any;
  initPromise?: Promise<any> = null;
  constructor(private readonly ethService: EthService) {

  }
  async ngOnInit(): Promise<void> {
    
  }

  async connectMetamask(e) {
  
   if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // Ask User permission to connect to Metamask
      await provider.send("eth_requestAccounts", []);
   };
  }
}
