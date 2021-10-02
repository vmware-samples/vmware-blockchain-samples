import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/ganymede/components/services/app.service';
import { EthereumService } from 'src/app/main/ethereum.service';
import { mockAccounts } from 'src/app/main/test-mock.data';

@Component({
  selector: 'app-god-account',
  templateUrl: './god-account.component.html',
  styleUrls: ['./god-account.component.scss']
})
export class GodAccountComponent implements OnInit {

  account;
  godAddress: string = mockAccounts.godAccount.address;
  godPrivateKey: string = mockAccounts.godAccount.privateKey;
  godBalance = null;

  currentAccountBalance = '-';

  sendForm = new FormGroup({
    address: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    amount: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
  });

  constructor(
    public app: AppService,
    private ethService: EthereumService,
  ) {
    this.account = this.ethService.createAccount();
    this.account.address = mockAccounts.godAccount.address;
    this.account.privateKey = mockAccounts.godAccount.privateKey;
    this.app.store.eth.account.balance.data$.subscribe(balances => {
      if (balances[this.ethService.currentAccount]) { this.currentAccountBalance = balances[this.ethService.currentAccount]; }
      if (balances[this.godAddress]) { this.godBalance = balances[this.godAddress]; }
    });
  }

  async ngOnInit() {
    await this.ethService.getAccountBalance(this.godAddress);
  }

  async sendBalance() {
    const address = this.sendForm.controls.address.value;
    const amount = this.sendForm.controls.amount.value;
    const res = await this.ethService.sendEth(this.account, address, amount);
    if (res && res.status === 'ok') {
      this.ethService.getAccountBalance(this.account.address);
      this.ethService.getAccountBalance(address);
    }
  }

}
