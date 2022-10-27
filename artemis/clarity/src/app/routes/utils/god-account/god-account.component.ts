import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppService } from 'src/app/ganymede/components/services/app.service';
import { ThemeSelectorComponent } from 'src/app/ganymede/components/settings/theme-selector/theme-selector.component';
import { EthereumService } from 'src/app/main/ethereum.service';
import { mockAccounts } from 'src/app/main/test-mock.data';

@Component({
  selector: 'app-god-account',
  templateUrl: './god-account.component.html',
  styleUrls: ['./god-account.component.scss']
})
export class GodAccountComponent implements OnInit {

  //TODO: make god account relevant again
  account;
  // godAddress: string = mockAccounts.godAccount.address;
  godAddress: string = null;
  // godPrivateKey: string = mockAccounts.godAccount.privateKey;
  godPrivateKey: string = null;
  godBalance = null;

  currentAccountBalance = '-';

  sendForm = new FormGroup({
    address: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    amount: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
  });
  sendingResultModalShown = false;
  sendingResultModalMessage = '';
  sendingResultModalData = '';
  sendingResultHasError = false;

  constructor(
    public app: AppService,
    private ethService: EthereumService,
  ) {
    this.account = this.ethService.createAccount();
    this.godAddress = this.account.address;
    this.godPrivateKey = this.account.privateKey;
    // this.account.address = mockAccounts.godAccount.address;
    // this.account.privateKey = mockAccounts.godAccount.privateKey;
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
    const result = await this.ethService.sendEth(this.account, address, amount);
    if (result && result.status === 'ok') {
      this.ethService.getAccountBalance(this.account.address);
      this.ethService.getAccountBalance(address);
    }
    const resultJson = result.receipt ? result.receipt : result.error;
    this.sendingResultHasError = result.receipt ? false : true;
    if (!this.sendingResultHasError) {
      this.sendingResultModalMessage = 'Transaction successfully processed.';
    } else {
      switch (resultJson.code) {
        case 4001:
          this.sendingResultModalMessage = 'User canceled transaction signing.'; break;
        default:
          this.sendingResultModalMessage = 'Failed during transaction processing.'; break;
      }
    }
    this.sendingResultModalShown = true;
    this.sendingResultModalData = JSON.stringify(resultJson, null, 4);
  }

}
