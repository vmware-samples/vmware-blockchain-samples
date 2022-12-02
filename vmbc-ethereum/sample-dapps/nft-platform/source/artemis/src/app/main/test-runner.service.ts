import { Injectable } from '@angular/core';
import { DigitalArtsService } from './digital-arts.service';
import { EthereumService } from './ethereum.service';
import { mockDigitalArts } from './test-mock.data';

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

  //mints all artwork in ./test-mock.data.ts with mock test account
  async mockDigitalArts(cb?: (art, result) => void) {
    await this.mockAccount();
    await this.digitalArtsService.waitForIt();
    let i = 0;
    for (const art of mockDigitalArts) {
      if(i > 2) break;
      let result;
      try{
        result = await this.digitalArtsService.testMint(art.title, art.artist, art.imageUrl);
        if (cb) { cb(art, result); }
      } catch (err) {
        console.log(err);
      }
      i++;
    }
    await this.digitalArtsService.refreshInventory();
  }

  //used to use the mainTester account in ./test-mock.data.ts but mocks randomly made test account
  async mockAccount() {
    if (this.accountMocked) { return; }
    this.accountMocked = true;
    this.ethService.testerLoadAccount();
  }

  async runAllTests() {
    if (this.testRan) { return; }
    this.testRan = true;
    await this.mockDigitalArts();
  }

}