import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DigitalArt } from '../../main/models/digital-art.model';
import { DigitalArtsService } from 'src/app/main/digital-arts.service';
import { EthereumService } from 'src/app/main/ethereum.service';
import { AppService } from 'src/app/ganymede/components/services/app.service';
import { Subscription } from 'rxjs';

const urlRegEx = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

@Component({
  selector: 'app-digital-arts',
  templateUrl: './digital-arts.component.html',
  styleUrls: ['./digital-arts.component.scss']
})
export class DigitalArtsComponent implements OnInit, OnDestroy {

  //for minting function and UI
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

  //magic numbers
  mintingTimeDelay = 333;
  mintingMessageJsonIndentSpaces = 4;

  cardCheckLimit = 7000;
  cardCheckInterval = 250;

  //art arrays
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
    //subscribes to minting form UI
    this.mintingFormSub = this.mintingForm.statusChanges.subscribe(status => {
      this.mintingFormStatus = status;
      this.mintingFormCheck();
    });

    //subscribes to tabs and maps art according to each category
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
    /*
      List of errors caught:
        invalid (not empty) title, artistName, imageUrl (caught by .required Validator)
        imageUrl is a URL following urlRegEx (caught by .pattern Validator)
    */
    if (ctrls.title.invalid || ctrls.artistName.invalid || ctrls.imageUrl.invalid) {
      valid = false;
    } else if (status) {
      if (status === 'INVALID') {
        valid = false;
      }
    }
    this.mintingFormValidity = valid;
    return valid;
  }

  //constantly checks validity of entered fields
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
    }, this.mintingTimeDelay);
  }

  //handles minting for UI
  async mintingHandle() {
    if (this.mintingInProgress) { return; }
    this.mintingForm.updateValueAndValidity();
    if (this.mintingFormValidity) {
      //UI setup
      const modalRef = this.mintingModal.focusTrap.parentElement;
      const modalContentRef = modalRef.getElementsByClassName('modal-dialog')[0];
      modalContentRef.classList.add('modal-noninteractable');
      this.mintingInProgress = true;

      //minting parameters
      const title = this.mintingForm.controls.title.value;
      const artistName = this.mintingForm.controls.artistName.value;
      const imageUrl = this.mintingForm.controls.imageUrl.value;

      let result;
      try {
        result = await this.digitalArtsService.mint(title, artistName, imageUrl);

        //UI cleanup
        this.mintingInProgress = false;
        modalContentRef.classList.remove('modal-noninteractable');
        this.mintingModalShown = false;

        //success message
        this.mintingResultModalMessage = 'Transaction successfully processed';
        this.mintingResultHasError = false;
        this.mintingResultModalData = JSON.stringify(result, null, this.mintingMessageJsonIndentSpaces);
        this.mintingResultModalShown = true;

        this.digitalArtsService.refreshInventory();

        /*
          Scrolls UI to newly inserted element

          TODO: fix this
        */
        const checkerStart = Date.now();
        const cardChecker = setInterval(() => {
          const el = document.getElementById(`digital-art-grid-token-${this.digitalArtsService.totalArtsSupply.toNumber() - 1}`);
          if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            clearInterval(cardChecker);
          }
          if (Date.now() - checkerStart > this.cardCheckLimit) { clearInterval(cardChecker); }
        }, this.cardCheckInterval);

      } catch (err) {
        //UI cleanup
        this.mintingInProgress = false;
        modalContentRef.classList.remove('modal-noninteractable');
        this.mintingModalShown = false;

        //error handling: ideally should test later on for all possible cases of failure
        switch(this.digitalArtsService.error.code){
          case "ACTION_REJECTED":
            this.mintingResultModalMessage = "User cancelled transaction before signing";
            break;
          case -32603:
            // Todo: Extract the message from a json inside this.digitalArtsService.error.message
            if ((this.digitalArtsService.error.message).includes("Permission denied")) {
              this.mintingResultModalMessage = 'Minting failed due to lack of permissions';
            } else {
              this.mintingResultModalMessage = 'Minting failed due to non-uniqueness of NFT';
            }
            break;
          default:
            this.mintingResultModalMessage = 'Transaction failed';
            break;
        }
        console.log("this.digitalArtsService.error is: " + JSON.stringify(this.digitalArtsService.error));
        delete this.digitalArtsService.error.stack;
        console.log("this.digitalArtsService.error is: " + JSON.stringify(this.digitalArtsService.error));
        //failure message
        this.mintingResultHasError = true;
        this.mintingResultModalData = JSON.stringify(this.digitalArtsService.error, null, this.mintingMessageJsonIndentSpaces);
        this.mintingResultModalShown = true;
      }
    }
  }

  mintingFormReset() {
    this.mintingForm.reset();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if(this.mintingFormSub) {
      this.mintingFormSub.unsubscribe();
    }
  }

}
