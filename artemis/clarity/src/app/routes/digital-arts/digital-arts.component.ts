import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { v4 as uuidv4 } from 'uuid';

import { DigitalArt } from '../../main/models/digital-art.model';

import { DigitalArtsService } from 'src/app/main/digital-arts.service';
import { EthereumService } from 'src/app/main/ethereum.service';
import { AppService } from 'src/app/ganymede/components/services/app.service';
import { Subscription } from 'rxjs';
import { TestRunnerService } from 'src/app/main/test-runner.service';

const urlRegEx = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

@Component({
  selector: 'app-digital-arts',
  templateUrl: './digital-arts.component.html',
  styleUrls: ['./digital-arts.component.scss']
})
export class DigitalArtsComponent implements OnInit, OnDestroy {

  @ViewChild('mintingModal') mintingModal;
  mintingForm = new FormGroup({
    title: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    artistName: new FormControl('', { validators: [Validators.required], updateOn: 'blur' }),
    imageUrl: new FormControl('', { validators: [Validators.required, Validators.pattern(urlRegEx)], updateOn: 'blur' }),
  });
  mintingModalShown = false;
  mintingFormValidity = true;
  mintingFormStatus = '';
  mintingFormSub: Subscription;
  mintingDelayedChecker: any;
  mintingInProgress = false;
  mintingResultModalShown = false;
  mintingResultModalMessage = '';
  mintingResultModalData = '';
  mintingResultHasError = false;

  digitalArts = DigitalArtsService.skel?.ds?.digitalArts;
  arts: DigitalArt[] = [];
  artsMintedByMe: DigitalArt[] = [];
  artsOwnedByMe: DigitalArt[] = [];
  artsTradedAway: DigitalArt[] = [];

  constructor(
    private app: AppService,
    private ethService: EthereumService,
    private digitalArtsService: DigitalArtsService,
  ) {
    this.mintingFormSub = this.mintingForm.statusChanges.subscribe(status => {
      this.mintingFormStatus = status;
      this.mintingFormCheck();
    });
    this.app.store.digitalArtsData.digitalArts.data$.subscribe(artsMap => {
      this.arts = this.digitalArtsService.flattenArtsMap(artsMap);
      this.artsMintedByMe = this.arts.filter(a => {
        return a.ownerHistory[0] === this.ethService.currentAccount;
      });
      this.artsOwnedByMe = this.arts.filter(a => {
        return a.ownerHistory[a.ownerHistory.length - 1] === this.ethService.currentAccount;
      });
      this.artsTradedAway = this.arts.filter(a => {
        return (
          a.ownerHistory.indexOf(this.ethService.currentAccount) >= 0 &&
          a.ownerHistory[a.ownerHistory.length - 1] !== this.ethService.currentAccount
        );
      });
    });
    this.digitalArtsService.loadAllDigitalArts();
  }

  mintingFormCheck() {
    const ctrls = this.mintingForm.controls;
    let valid = true;
    if (ctrls.title.invalid || ctrls.artistName.invalid || ctrls.imageUrl.invalid) {
      valid = false;
    } else if (status) {
      if (status === 'INVALID') { valid = false; }
    }
    this.mintingFormValidity = valid;
    return valid;
  }

  mintingDelayedValidation(event, fieldName: string) {
    const el = event.target;
    const locker = this.mintingDelayedChecker = {};
    setTimeout(() => {
      if (locker === this.mintingDelayedChecker) {
        const ctrls = this.mintingForm.controls;
        const ctrl = ctrls[fieldName];
        if (ctrl) {
          ctrl.setValue(el.value);
          this.mintingForm.updateValueAndValidity();
        }
        this.mintingFormCheck();
      }
    }, 333);
  }

  async mintingHandle() {
    if (this.mintingInProgress) { return; }
    this.mintingForm.updateValueAndValidity();
    if (this.mintingFormValidity) {
      const modalRef = this.mintingModal.focusTrap.parentElement;
      const modalContentRef = modalRef.getElementsByClassName('modal-dialog')[0];
      modalContentRef.classList.add('modal-noninteractable');
      this.mintingInProgress = true;
      const title = this.mintingForm.controls.title.value;
      const artistName = this.mintingForm.controls.artistName.value;
      const imageUrl = this.mintingForm.controls.imageUrl.value;
      const result = await this.digitalArtsService.mint(title, artistName, imageUrl);
      this.mintingInProgress = false;
      modalContentRef.classList.remove('modal-noninteractable');
      this.mintingModalShown = false;
      const resultJson = result.receipt ? result.receipt : result.error;
      this.mintingResultHasError = result.receipt ? false : true;
      if (!this.mintingResultHasError) {
        this.mintingResultModalMessage = 'Transaction successfully processed.';
      } else {
        switch (resultJson.code) {
          case 4001:
            this.mintingResultModalMessage = 'User canceled transaction signing.'; break;
          default:
            this.mintingResultModalMessage = 'Transaction failed to be processed.'; break;
        }
      }
      this.mintingResultModalShown = true;
      this.mintingResultModalData = JSON.stringify(resultJson, null, 4);
      if (result.receipt) {
        const tokId = result.receipt.events.Transfer.returnValues.tokenId;
        const checkerStart = Date.now();
        const cardChecker = setInterval(() => {
          const el = document.getElementById(`digital-art-grid-token-${tokId}`);
          if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            clearInterval(cardChecker);
          }
          if (Date.now() - checkerStart > 7000) { clearInterval(cardChecker); }
        }, 250);
      }
    }
  }

  mintingFormReset() {
    this.mintingForm.reset();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.mintingFormSub) { this.mintingFormSub.unsubscribe(); }
  }

}
