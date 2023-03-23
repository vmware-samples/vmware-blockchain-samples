import { Component, OnInit } from '@angular/core';
import {ethers} from 'ethers';
declare let window: any;
let permissionMap = new Map<String,string>(); 


@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss']
})

export class ConfigurationsComponent implements OnInit {
  fromAddress: String = "";
  toAddress: String = "0x0000000000000000000000000000000000000000";
  readPermission: boolean = true;
  writePermission: boolean = false;
  deployPermission: boolean = false;
  adminPermission: boolean = false;
  alertFailure: boolean = false;
  alertSuccess:boolean = false;
  categoryEditModal: boolean = true;
  openModal: boolean = true;
  permissionModal: boolean=false;
  response: any;
  errorMessage: any;
  errorData: any;
  read:Number   = 1;
  write:Number  = 2;
  deploy:Number = 4;
  admin:Number  = 8;
  writeVisible: boolean = false;
  deployVisible: boolean = false;
  responseHash: boolean = false;
  responseHashFailed: boolean = false;

  tmp:Number = 0;
  
  map=permissionMap;

  allPermissions:Number = 0;
  contractAddress: String = "0x57a268e7694371880a2c5881bd240db812bbfbf0";
  displayPermissions:String = "";

  onWritePermissionChange(e) {
    if(e.target.checked){
      this.writePermission = true;
    } else {
      this.writePermission = false;
    }
  }

  onDeployPermissionChange(e) {
    if(e.target.checked){
      this.deployPermission = true;
    } else {
      this.deployPermission = false;
    }
  }

  onAdminPermissionChange(e) {
    if(e.target.checked){
      this.adminPermission = true;
    } else {
      this.adminPermission = false;
    }
  }
  
  onFromAddressChange(e) {
    this.fromAddress=e.target.value;
    this.map=new Map<String,string>();
  }

  constructor() { }

  ngOnInit(): void {
  }

  
  validateAddress() {
    if  (ethers.utils.isAddress(this.fromAddress.toString()) === false) {
      alert("Invalid FromAddress" +this.fromAddress.toString())
      process.exit(1);
    }
    if  (ethers.utils.isAddress(this.toAddress.toString()) === false) {
      alert("Invalid ToAddress" +this.toAddress.toString())
      process.exit(1);
    }
  }
  displayPermissionValues() {
    this.displayPermissions = "";
    if ((Number(this.tmp) & Number(this.read))) {
      this.displayPermissions = String(this.displayPermissions) + "R "
    }
    if ((Number(this.tmp) & Number(this.write))) {
      this.displayPermissions = String(this.displayPermissions) + "W "
    }
    if ((Number(this.tmp) & Number(this.deploy))) {
      this.displayPermissions = String(this.displayPermissions) + "D "
    }
  }

  getAllPermissionValues() {
    this.allPermissions = 0;
    if (this.readPermission) {
      this.allPermissions = Number(this.allPermissions) + Number(this.read);
    }
    if (this.writePermission) {
      this.allPermissions = Number(this.allPermissions) + Number(this.write);
    }
    if (this.deployPermission) {
      this.allPermissions = Number(this.allPermissions) + Number(this.deploy);
    }
    if (this.adminPermission) {
      this.allPermissions = Number(this.allPermissions) + Number(this.admin);
    }
  }
  onCloseModal(){
    this.permissionModal=false;
    this.alertSuccess=false;
    this.alertFailure=false;
    this.writeVisible = false;
    this.deployVisible = false;
    this.alertSuccess=false;
    this.responseHash=false;
    this.responseHashFailed=false;
  }

  async checkPermissions(e) {
    this.validateAddress();
    this.getAllPermissionValues();

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const ABI =["function updatePermissions(address from, address to, uint8 action)",
                "function checkUserAction(address from, address to, uint8 action) external view returns(bool)"];
    const signer = provider.getSigner()
    const permissionContract = new ethers.Contract(this.contractAddress.toString(), ABI, signer);

    const response = await permissionContract.checkUserAction(this.fromAddress, this.toAddress, this.allPermissions);
    //if (response) {
      this.tmp = response;
      this.displayPermissionValues()
      this.permissionModal= true;
      //alert(this.allPermissions)
      if (!response) {
        if(this.writePermission){
          this.writeVisible = false;
        }
        if(this.deployPermission){
          this.deployVisible = false;
        }
        this.alertFailure=true;
      } else {
        if(!this.writePermission&&!this.deployPermission){
          this.allPermissions=0;
          this.allPermissions = Number(this.allPermissions) + Number(this.write);
          const write = await permissionContract.checkUserAction(this.fromAddress, this.toAddress, this.allPermissions);
          if(!write){
            this.map.set("Write", "No Permission Given");
            this.writeVisible = false;
          }else{
            this.map.set("Write", "Permission Given");
            this.writeVisible = true;
          }
          this.allPermissions=0;
          this.allPermissions = Number(this.allPermissions) + Number(this.deploy);
          const deploy = await permissionContract.checkUserAction(this.fromAddress, this.toAddress, this.allPermissions);
          if(!deploy){
            this.map.set("Deploy", "No Permission Given");
            this.deployVisible = false;
          }else{
            this.map.set("Deploy", "Permission Given");
            this.deployVisible = true;
          }
          if(!this.writeVisible&&!this.deployVisible){
            this.alertFailure=true;
          }
        }else{
          if(this.writePermission){
            this.map.set("Write", "Permission Given");
            this.writeVisible = true;
          }
          if(this.deployPermission){
            this.map.set("Deploy", "Permission Given");
            this.deployVisible = true;
          }
        }
        this.alertSuccess=true;
      }
        // console.log(this.map);
    //}
  }

  async setPermissions(e) {
    this.validateAddress();
    this.getAllPermissionValues();
    //alert("Permissions "+Number(this.allPermissions).toString(2))

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const ABI =["function updatePermissions(address from, address to, uint8 action)",
                "function checkUserAction(address from, address to, uint8 action) external view returns(bool)"];
    const signer = provider.getSigner()
    const permissionContract = new ethers.Contract(this.contractAddress.toString(), ABI, signer);

    try {
      this.response = await permissionContract.updatePermissions(this.fromAddress, this.toAddress, this.allPermissions);
    } catch (error) {
      let JSONError = JSON.parse(JSON.stringify(error));
      let message=JSONError.message;
      var removeExtraString = message.replace('[ethjs-query] while formatting outputs from RPC','');
      var removeSingleQuotes=removeExtraString.replace(/'/g, "");
      let JS= JSON.parse(removeSingleQuotes);

      this.errorMessage = JS.value.data.message;
      this.errorData = JS.value.data.data;

      this.permissionModal= true;
      this.responseHashFailed=true;
      return;
    }
    if (this.response) {
      this.permissionModal= true;
      this.responseHash=true;
    }  
    
  }
  
}
