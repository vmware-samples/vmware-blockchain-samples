import { Component, OnInit } from '@angular/core';
import {ethers} from 'ethers';
import Config from '../../assets/config.json';
import TokenAbi from '../../assets/abi/Token.sol/Token.json';

declare let window: any;
let web3: any;

const provider = new ethers.providers.Web3Provider(
  (window as any).ethereum
);

@Component({
  selector: 'app-dapp',
  templateUrl: './dapp.component.html',
  styleUrls: ['./dapp.component.scss']
})
export class DappComponent implements OnInit {
  fromAddress: String = "";
  toAddress: String = "";
  contractAddress: String = Config.DEFAULT_ERC20_CONTRACT_ADDRESS;
  balance: Number = 0;
  tokens: Number = 0;
  transferModal: boolean=false;
  tokenBalanceModal: boolean=false;
  balanceAmount: boolean=false;
  tokenTransfer: boolean=false;
  response: any;
  failedTransfer: boolean=false;
  errorMessage: any;
  errorData: any;
  constructor() { } 

  onToAddressChange(e) {
    this.toAddress=e.target.value;
  }
  onTokensChange(e) {
    this.tokens=e.target.value;
  }
  onContractAddressChange(e) {
    this.contractAddress=e.target.value;
  }
  onCloseModal(){
    this.transferModal=false;
    this.tokenBalanceModal=false;
    this.tokenTransfer=false;
    this.failedTransfer=false;
  }
  async getCurrentProvider(){
    const addresses = await provider.listAccounts(); 
    this.fromAddress=addresses[0];
  }
  
  async transferTokens(e) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner(); 
    const tokenContract = new ethers.Contract(this.contractAddress.toString(), TokenAbi.abi, signer);
    
    try {
    this.response = await tokenContract.transfer(this.toAddress, this.tokens);
    } catch(error) {
      let JSONError = JSON.parse(JSON.stringify(error));
      let message=JSONError.message;
      var removeExtraString = message.replace('[ethjs-query] while formatting outputs from RPC','');
      var removeSingleQuotes=removeExtraString.replace(/'/g, "");

      let JS= JSON.parse(removeSingleQuotes);
      this.errorMessage = JS.value.data.message;
      this.errorData = JS.value.data.data;

      this.transferModal=true;
      this.tokenTransfer=false;
      this.failedTransfer=true;
      return;
    }
    if (this.response) {
      this.transferModal=true;
      this.tokenTransfer=true;
      // alert(response.hash);
    } 
  }

  async onGetBalance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);              
    const tokenContract = new ethers.Contract(this.contractAddress.toString(), TokenAbi.abi, provider);
    this.balance = await tokenContract.balanceOf(this.fromAddress);
    this.tokenBalanceModal=true;
    if (this.balance) {
      this.balanceAmount=true;
    } else {
      this.balanceAmount=false;
      // alert("getbalance Failed !")
    }
  }
  ngOnInit(): void {
  }
  ngDoCheck():void{
    this.getCurrentProvider();
  }

}
