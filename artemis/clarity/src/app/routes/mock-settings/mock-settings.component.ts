import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TestRunnerService } from 'src/app/main/test-runner.service';

@Component({
  selector: 'app-mock-settings',
  templateUrl: './mock-settings.component.html',
  styleUrls: ['./mock-settings.component.scss']
})
export class MockSettingsComponent implements OnInit {

  @ViewChild('nftOutputArea') nftOutputArea: ElementRef;
  nftArtsAdded = [];
  nftArtsAddInProgress = false;

  constructor(
    private testRunner: TestRunnerService,
  ) {}

  ngOnInit() {}

  async nftArtsScenario() {
    if (this.nftArtsAddInProgress) { return; }
    this.nftArtsAddInProgress = true;
    this.nftArtsAdded = [];
    await this.testRunner.mockDigitalArts((art, result) => {
      this.nftArtsAdded.push({ art, result });
      if (this.nftOutputArea?.nativeElement) {
        setTimeout(() => {
          this.nftOutputArea.nativeElement.scrollTop = 999999999;
        }, 100);
      }
    });
    this.nftArtsAddInProgress = false;
  }

}
