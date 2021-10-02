import { Injectable } from '@angular/core';
import { DigitalArtsService } from './digital-arts.service';
import { EthereumService } from './ethereum.service';
import { mockAccounts, mockDigitalArts } from './test-mock.data';

@Injectable({
  providedIn: 'root'
})
export class TestRunnerService {

  testRan = false;
  accountMocked = false;

  constructor(
    private ethService: EthereumService,
    private digitalArtsService: DigitalArtsService,
  ) {}

  async mockDigitalArts(cb?: (art, result) => void) {
    await this.mockAccounts();
    await this.digitalArtsService.waitForIt();
    for (const art of mockDigitalArts) {
      const abi = this.digitalArtsService.mintAbi(art.title, art.artist, art.imageUrl);
      const result = await this.ethService.testerSubmit(this.digitalArtsService.contractAddress, abi);
      if (cb) { cb(art, result); }
    }
    await this.digitalArtsService.refreshInventory();
  }

  async mockAccounts() {
    if (this.accountMocked) { return; }
    this.accountMocked = true;
    this.ethService.testerLoadAccount(mockAccounts.mainTester.address, mockAccounts.mainTester.privateKey);
  }

  async runAllTests() {
    if (this.testRan) { return; }
    this.testRan = true;
    await this.mockDigitalArts();
  }

}
