import { Injectable } from '@angular/core';
import { DigitalArt } from './models/digital-art.model';
import { EthereumService } from './ethereum.service';
import { ethers } from 'ethers';
import { Subject } from 'rxjs';
import { DigitalArt as DigitalArtContract } from 'src/typechain/DigitalArt';
import { DigitalArt__factory } from 'src/typechain/factories/DigitalArt__factory';
import DigitalArtAbi from 'src/assets/abi/DigitalArt.sol/DigitalArt.json';
import Config from 'src/assets/config.json';

const baseData = {
  contract: null,
  contractAddressOverride: Config.DEFAULT_NFT_CONTRACT_ADDRESS,
  totalArtsSupply: null,
};

@Injectable({ providedIn: 'root' })
export class DigitalArtsService {

  initPromise;
  error: any;

  //magic number
  waitInterval = 100;

  mainContractAddress: string;
  mainContractStatus: 'NOT_FOUND' | 'BAD_ADDRESS' | 'CONNECTING' | 'CONNECTED' = 'CONNECTING';
  mainContract: DigitalArtContract;
  mainContractSubj = new Subject<DigitalArtContract>();
  mainContract$ = this.mainContractSubj.asObservable();

  digitalArts: DigitalArt[] = [];
  digitalArtsSubj = new Subject<DigitalArt[]>();
  digitalArts$ = this.digitalArtsSubj.asObservable();
  
  digitalArtByIndex: {[tokId: string]: DigitalArt} = {};
  digitalArtsByOwner: {[owner: string]: DigitalArt[]} = {};
  digitalArtsByMinter: {[minter: string]: DigitalArt[]} = {};

  constructor(
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
    this.mainContractAddress = Config.DEFAULT_NFT_CONTRACT_ADDRESS;
    await this.ethService.waitForEthWindow();
  }

  //init() using the contract compiled upon start
  async initializeDigitalArtsContract() {
    if (baseData.contract) { return baseData.contract; }
    
    baseData.contract = new ethers.Contract(this.mainContractAddress, DigitalArtAbi.abi, this.ethService.web3Provider);
    
    try{
      baseData.totalArtsSupply = await baseData.contract.totalSupply();
      console.log("Contract deployed successfully at " + baseData.contract.address);
      this.mainContractStatus = 'CONNECTED';

      this.mainContract = new ethers.Contract(baseData.contract.address, DigitalArtAbi.abi, this.ethService.web3Provider) as DigitalArtContract;
      this.mainContractAddress = baseData.contract.address;
      this.mainContractSubj.next(this.mainContract);
    } catch(err){
      console.log(err);
      this.mainContractStatus = 'NOT_FOUND';
    }

    return baseData.contract;
  }

  async refreshContractAddress(newAddress: string) {
    newAddress = newAddress.trim();
    if (newAddress.length !== 42 || !newAddress.startsWith('0x')) {
      console.log(`Bad address ${newAddress}`);
      this.mainContractStatus = 'BAD_ADDRESS';
      this.mainContract = new ethers.Contract(newAddress, DigitalArtAbi.abi, this.ethService.web3Provider) as DigitalArtContract;
      this.mainContractSubj.next(this.mainContract);
      return;
    }
    baseData.contract = new ethers.Contract(newAddress, DigitalArtAbi.abi, this.ethService.web3Provider);
    try {
      await baseData.contract.totalSupply();
      console.log(`NFT Contract Address Changed: ${newAddress}`);
      window.location.reload();
    } catch (e) {
      console.log(`Contract ${newAddress} not found`);
      this.mainContractStatus = 'NOT_FOUND';
      this.mainContract = new ethers.Contract(newAddress, DigitalArtAbi.abi, this.ethService.web3Provider) as DigitalArtContract;
      this.mainContractSubj.next(this.mainContract);
      return;
    }
  }

  async deployNewNftContract() {
    const digitalArtFactory = new DigitalArt__factory(this.ethService.currentSigner);
    const tx = await digitalArtFactory.deploy("0x0000000000000000000000000000000000000000", false);
    this.refreshContractAddress(tx.address);
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
    const digitalArts = [];
    const digitalArtsByOwner = {};
    const digitalArtsByMinter = {};
    for (let i = 0; i < baseData.totalArtsSupply; ++i) {
      const index = i + '';
      const artObj = await this.fetchArtByTokenId(index);
      this.digitalArtByIndex[index] = artObj;
      digitalArts.push(artObj);
      if (!digitalArtsByOwner[artObj.currentOwner]) { digitalArtsByOwner[artObj.currentOwner] = []; }
      digitalArtsByOwner[artObj.currentOwner].push(artObj);
      if (!digitalArtsByMinter[artObj.minter]) { digitalArtsByMinter[artObj.minter] = []; }
      digitalArtsByMinter[artObj.minter].push(artObj);
    }
    this.digitalArts = digitalArts;
    this.digitalArtsByOwner = digitalArtsByOwner;
    this.digitalArtsByMinter = digitalArtsByMinter;
    this.digitalArtsSubj.next(this.digitalArts);
  }

  //getter
  async fetchArtByTokenId(index: string) {
    await this.waitForIt();
    const artObjData = await this.mainContract.DigitalArtArr(index) as any as DigitalArt;
    const artObj: DigitalArt = {
      title: artObjData.title,
      artistName: artObjData.artistName,
      image: artObjData.image,
      tokId: artObjData.tokId,
    };
    artObj.ownerHistory = await this.contract.getOwnerToken(index);
    artObj.effectiveImageUrl = artObj.image.startsWith('http://localhost') ? 
                                artObj.image.replace(/http\:\/\/localhost\.com/g, '')
                                : artObj.image;
    artObj.currentOwner = artObj.ownerHistory[artObj.ownerHistory.length - 1];
    artObj.minter = artObj.ownerHistory[0];
    return artObj;
  }

  //updates inventory
  async refreshInventory() {
    await this.waitForIt();
    const indexNow = await this.contract.totalSupply();
    if (indexNow === this.totalArtsSupply) return; // no new NFTs
    this.totalArtsSupply = indexNow;
    await this.loadAllDigitalArts();
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
      transaction = await newContract.mint(title, imageUrl, artist, this.ethService.currentAccount);
    } catch (err) {
      console.log(err);
      this.error = err;
    }
    const confirmWait = transaction.wait();
    confirmWait.then(() => {
      // new mint should refresh collection after confirm
      this.loadAllDigitalArts();
    });
    return confirmWait;
  }

  //for mock art minting
  async testMint(title: string, artist: string, imageUrl: string){
    const newContract = await this.contract.connect(this.ethService.testAccount);
    let transaction;
    try {
      transaction = await newContract.mint(title, imageUrl, artist, this.ethService.currentAccount);
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
      transaction = await newContract.approveTransfer(to, tokenId);
    } catch (err) {
      console.log(err);
      this.error = err;
    }
    const confirmWait = transaction.wait();
    confirmWait.then(() => {
      // new mint should refresh collection
      this.loadAllDigitalArts();
    });
    return confirmWait;
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
