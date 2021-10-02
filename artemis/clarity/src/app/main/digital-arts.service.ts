import { Injectable } from '@angular/core';
import { rx, AppService } from '../ganymede/components/services/app.service';
import { DigitalArt } from './models/digital-art.model';
import { EthereumService } from './ethereum.service';

const DigitalArtAbi = require('../../../../src/abis/DigitalArt.json');

declare var window: any;
const storeEnabled = true;
const contractAddrs = [
  '0x7373de9d9da5185316a8D493C0B04923326754b2',
  '0x332e82368Be5c75B1dBb4c8ce1aaF5F0f27477DD'
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
      const artObj = await baseData.contract.methods.DigitalArtArr(index).call() as DigitalArt;
      artObj.ownerHistory = await baseData.contract.methods.getOwnerToken(index).call();
      artObj.effectiveImageUrl = artObj.image.replace(/http\:\/\/localhost\.com/g, '');
      const newVal = rx.setkv(data.v, e.params.key, artObj);
      data.setValue(newVal);
      if (e.params.ondata) { e.params.ondata(newVal[key]); }
      return newVal;
    })
  }});

}

@Injectable({ providedIn: 'root' })
export class DigitalArtsService {

  static skel: DigitalArtsService;

  rx = DigitalArtsDataCollection.rx;
  ds = DigitalArtsDataCollection.rx.data;
  initPromise;

  constructor(
    public app: AppService,
    private ethService: EthereumService,
  ) {
    this.initialize();
  }

  get ready() { return (this.ethService.currentAccount && baseData.totalArtsSupply !== null) ? true : false; }
  get contract() { return baseData.contract; }
  get contractAddress() { return baseData.contract._address; }
  get totalArtsSupply() { return baseData.totalArtsSupply; }
  set totalArtsSupply(v) { baseData.totalArtsSupply = v; }

  async initialize() {
    await this.ethService.waitForProvider();
  }

  async initializeDigitalArtsContract() {
    if (baseData.contract) { return baseData.contract; }
    const web3 = this.ethService.web3;
    // const netId = await web3.eth.net.getId();
    const abi = DigitalArtAbi.abi;
    const address = baseData.contractAddressOverride;
    baseData.contract = new web3.eth.Contract(abi, address);
    baseData.totalArtsSupply = await baseData.contract.methods.totalSupply().call();
    return baseData.contract;
  }

  async waitForIt() {
    if (this.initPromise) { return this.initPromise; }
    await this.ethService.waitForProvider();
    await this.initializeDigitalArtsContract();
    const prom = new Promise<boolean>(async resolve => {
      if (this.ready) { return resolve(true); }
      const checker = setInterval(() => {
        if (this.ready) { clearInterval(checker); return resolve(true); }
      }, 100);
    });
    this.initPromise = prom;
    await prom;
    this.initPromise = null;
    return;
  }

  async loadAllDigitalArts() {
    await this.waitForIt();
    for (let i = 0; i < this.totalArtsSupply; i++) {
      rx.invoke(this.app.store.digitalArtsData.digitalArts.actions.FETCH, { key: (i + '') });
    }
  }

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

  async refreshInventory() {
    const indexNow = await this.contract.methods.totalSupply().call();
    if (indexNow === this.totalArtsSupply) { // no new nft
      return;
    }
    for (let i = this.totalArtsSupply; i < indexNow; i++) {
      rx.invoke(this.app.store.digitalArtsData.digitalArts.actions.FETCH, { key: (i + '') });
    }
    this.totalArtsSupply = indexNow;
  }

  mintAbi(title: string, artist: string, imageUrl: string) {
    return this.contract.methods.mint(title, imageUrl, artist).encodeABI();
  }

  async mint(title: string, artist: string, imageUrl: string) {
    return new Promise<any>(async resolve => {
      await this.waitForIt();
      this.contract.methods
        .mint(title, imageUrl, artist)
        .send({
          from: this.ethService.currentAccount,
          gas: 999999999,
          gasPrice: 1,
        })
        .once('receipt', async (receipt) => {
          resolve({ status: 'ok', receipt });
          this.refreshInventory();
        })
        .on('error', error => {
          resolve({ status: 'error', error });
      });
    });
  }

  async transfer(tokenId: string, to: string) {
    return new Promise<any>(async resolve => {
      await this.waitForIt();
      // do inferred ownership
      this.contract.methods
        .approveTransfer(to, tokenId)
        .send({from: this.ethService.currentAccount})
        .once('receipt', receipt => {
          resolve({ status: 'ok', receipt });
          // this.setState({clickPop:false});
          // window.location.reload();
        })
        .on('error', error => {
          resolve({ status: 'error', error });
      });
    });
  }

  flattenArtsMap(artsMap: {[key: string]: DigitalArt}) {
    const arts: DigitalArt[] = [];
    for (const key of Object.keys(artsMap)) {
      arts.push(artsMap[key]);
    }
    return arts;
  }

}
