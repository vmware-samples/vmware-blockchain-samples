import { Component, OnInit } from '@angular/core';
import { sleepms } from '@jovian/type-tools/common/ix.timer';
import { EthereumService } from 'src/app/main/ethereum.service';

@Component({
  selector: 'app-account-gen',
  templateUrl: './account-gen.component.html',
  styleUrls: ['./account-gen.component.scss']
})
export class AccountGenComponent implements OnInit {

  address: string = '';
  privateKey: string = '';

  constructor(
    private ethService: EthereumService,
  ) { }

  ngOnInit(): void {
  }

  async generateNewAccount() {
    const acc = this.ethService.createAccount();
    this.address = acc.address;
    this.privateKey = acc.privateKey;
  }

}
