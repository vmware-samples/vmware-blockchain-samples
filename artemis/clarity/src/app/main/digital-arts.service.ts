import { Injectable } from '@angular/core';
import { rx, AppService } from '../ganymede/components/services/app.service';
import { DigitalArt } from './models/digital-art.model';
import { EthereumService } from './ethereum.service';
import { ethers } from '@vmware-blockchain/ethers';

const DigitalArtAbi = require('../../../../src/abis/DigitalArt.json');

declare var window: any;
const storeEnabled = true;
const contractAddrs = [
  /*
    insert the address of deployed DigitalArts contract on chain here and ensure the other addresses are deleted
    in order for Artemis/NFT demo dapp to operate properly
  */
  '0x8780125d9a74963492B3e12C9F6C3F7F8a00E9E8',
  '0x8780125d9a74963492B3e12C9F6C3F7F8a00E9E8'
];
const baseData = {
  contract: null,
  contractAddressOverride: true ? contractAddrs[0] : null,
  totalArtsSupply: null,
};

export class DigitalArtsDataCollection {
  static namespace = 'digitalArtsData';
  static rx: rx.StoreEntry<DigitalArtsDataCollection>;
  static registered = storeEnabled ? DigitalArtsDataCollection.rxRegister() : false;
  static rxRegister() { return this.registered ? null : this.rx = new rx.StoreEntry(this.namespace, this); }

  digitalArts = new rx.Data<any>({ firstValue: {}, actions: {
    FETCH: new rx.Action<DigitalArt>({}, async (e: rx.ActionArgs<DigitalArt>) => {
      const data = e.data;
      const key = e.params.key;
      const index = parseInt(key, 10);
      const artObj = await baseData.contract.DigitalArtArr(index) as DigitalArt; //alias

      //contents of digitalArt object must match that of ./models/digital-art.model.ts and map key to value
      const digitalArt: DigitalArt = {
        tokId: artObj.tokId,
        title: artObj.title,
        image: artObj.image,
        artistName: artObj.artistName,
        ownerHistory: await baseData.contract.getOwnerToken(index),
        effectiveImageUrl: artObj.image.replace(/http\:\/\/localhost\.com/g, '')
      }

      const newVal = rx.setkv(data.v, e.params.key, digitalArt);
      data.setValue(newVal);
      if (e.params.ondata) {
        e.params.ondata(newVal[key]);
      }
      return newVal;
    })
  }});

}

@Injectable({ providedIn: 'root' })
export class DigitalArtsService {

  static skel: DigitalArtsService;

  //rx stores
  rx = DigitalArtsDataCollection.rx;
  ds = DigitalArtsDataCollection.rx.data;

  initPromise;
  error: any;

  //magic number
  waitInterval = 100;

  constructor(
    public app: AppService,
    public ethService: EthereumService,
  ) {
    this.initialize();
  }

  //getters
  get ready() { return (this.ethService.currentAccount && baseData.totalArtsSupply !== null) ? true : false; }
  get contract() { return baseData.contract; }
  get contractAddress() { return baseData.contract.address; }
  get totalArtsSupply() { return baseData.totalArtsSupply; }
  set totalArtsSupply(v) { baseData.totalArtsSupply = v; }

  //init()
  async initialize() {
    await this.ethService.waitForEthWindow();
  }

  //init()
  async initializeDigitalArtsContract() {
    if (baseData.contract) { return baseData.contract; }
    const abi = DigitalArtAbi.abi;
    const address = baseData.contractAddressOverride;
    baseData.contract = new ethers.Contract(address, abi, this.ethService.web3Provider);
    baseData.totalArtsSupply = await baseData.contract.totalSupply();
    return baseData.contract;
  }

  //sets up inits
  async waitForIt() {
    if (this.initPromise) { return this.initPromise; }
    await this.ethService.waitForEthWindow();
    await this.initializeDigitalArtsContract();
    const prom = new Promise<boolean>(async resolve => {
      if (this.ready) { return resolve(true); }
      const checker = setInterval(() => {
        if (this.ready) { clearInterval(checker); return resolve(true); }
      }, this.waitInterval);
    });
    this.initPromise = prom;
    await prom;
    this.initPromise = null;
    return;
  }

  //gets all NFTs
  async loadAllDigitalArts() {
    await this.waitForIt();
    for (let i = 0; i < this.totalArtsSupply; i++) {
      rx.invoke(this.app.store.digitalArtsData.digitalArts.actions.FETCH, { key: (i + '') });
    }
  }

  //getter
  async fetchArtByTokenId(tokId: string) {
    await this.waitForIt();
    let art: DigitalArt = null;
    await new Promise<void>(async resolve => {
      rx.invoke(this.app.store.digitalArtsData.digitalArts.actions.FETCH, {
        key: tokId,
        ondata: (fetchedArt) => {
          art = fetchedArt;
          resolve();
        }
      });
    });
    return art;
  }

  //updates inventory
  async refreshInventory() {
    const indexNow = await this.contract.totalSupply();
    if (indexNow === this.totalArtsSupply) return; // no new NFTs
    for (let i = this.totalArtsSupply; i < indexNow; i++) {
      rx.invoke(this.app.store.digitalArtsData.digitalArts.actions.FETCH, { key: (i + '') });
    }
    this.totalArtsSupply = indexNow;
  }

  //for testing
  mintAbi(title: string, artist: string, imageUrl: string) {
    return this.contract.mint(title, imageUrl, artist);
  }

  //standard mint function
  async mint(title: string, artist: string, imageUrl: string) {
    await this.waitForIt();
    const signer = await this.ethService.web3Provider.getSigner(this.ethService.currentAccount);
    const newContract = await this.contract.connect(signer);
    let transaction;
    try {
      transaction = await newContract.mint(title, imageUrl, artist);
    } catch (err) {
      console.log(err);
      this.error = err;
    }
    return transaction.wait();
  }

  //for mock art minting
  async testMint(title: string, artist: string, imageUrl: string){
    const newContract = await this.contract.connect(this.ethService.testAccount);
    let transaction;
    try {
      transaction = await newContract.mint(title, imageUrl, artist);
    } catch (err) {
      console.log(err);
      this.error = err;
    }
    return transaction.wait();
  }

  //standard transfer function
  async transfer(tokenId: string, to: string) {
    await this.waitForIt();
    const signer = await this.ethService.web3Provider.getSigner(this.ethService.currentAccount);
    const newContract = await this.contract.connect(signer);
    let transaction;
    try{ 
      transaction = newContract.approveTransfer(to, tokenId);
    } catch (err) {
      console.log(err);
      this.error = err;
    }
    return transaction;
  }

  //for art grid UI
  flattenArtsMap(artsMap: {[key: string]: DigitalArt}) {
    const arts: DigitalArt[] = [];
    for (const key of Object.keys(artsMap)) {
      arts.push(artsMap[key]);
    }
    return arts;
  }

}
