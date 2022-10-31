import { Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/ganymede/components/services/app.service';
import { DigitalArtsService } from 'src/app/main/digital-arts.service';
import { DigitalArt } from 'src/app/main/models/digital-art.model';

@Component({
  selector: 'app-digital-arts-details',
  templateUrl: './digital-arts-details.component.html',
  styleUrls: ['./digital-arts-details.component.scss']
})
export class DigitalArtsDetailsComponent implements OnInit, OnDestroy {

  //for transfer function and UI
  @ViewChild('transferModal') transferModal;
  transferForm = new FormGroup({
    address: new FormControl('', { validators: [Validators.required], updateOn: 'blur'})
  });
  transferModalShown = false;
  transferFormValidity = true;
  transferFormStatus = '';
  transferFormSub: Subscription;
  transferDelayedChecker: any;
  transferInProgress = false;
  transferResultModalShown = false;
  transferResultModalMessage = '';
  transferResultModalData = '';
  transferResultHasError = false;

  //magic numbers
  transferTimeDelay = 333;
  transferMessageJsonIndentSpaces = 4;

  paramsSub: Subscription;
  nftId: string;
  art: DigitalArt;

  constructor(
    private app: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private digitalArtsService: DigitalArtsService,
  ) {
    //subscribes to transfer form UI
    this.transferFormSub = this.transferForm.statusChanges.subscribe(status => {
      this.transferFormStatus = status;
      this.transferFormCheck();
    });

    //subscription tracking selected NFT's token Id
    this.paramsSub = this.route.params.subscribe(async params => {
      if (params.nftId) {
        if (this.nftId !== params.nftId) {
          this.nftId = params.nftId;
          if (this.app.store.digitalArtsData.digitalArts?.value?.[params.nftId]) {
            this.art = this.app.store.digitalArtsData.digitalArts.value[params.nftId];
            return;
          }
          this.art = null;
          const art = await this.digitalArtsService.fetchArtByTokenId(params.nftId);
          if (art) {
            this.art = art;
          }
        }
      }
    });
  }
  
  transferFormCheck() {
    const ctrls = this.transferForm.controls;
    let valid = true;
    /*
      List of errors caught:
        invalid (not empty) address (caught by .required Validator)
        address entered refers to self
        address bounds

    If the second clause of the first if statement and the setErrors call are not there,
    you can send NFTs to yourself

      TODO: add Validator Function for multi-error handling and add function handling on UI
    using *clrIfError and Validator.call(function) (so far unsuccessful)
    */
    if(ctrls.address.invalid || ctrls.address.value === this.art.ownerHistory[this.art.ownerHistory.length - 1]){
      valid = false;
      ctrls.address.setErrors({
        notOwner: true
      });
    } else if(ctrls.address.value.length <= 14 || ctrls.address.value.length >= 74){
      //Info is debatable in validity, but addresses should be between 14 and 74 characters (or 26-58?)
      valid = false;
      ctrls.address.setErrors({
        notInAddressLengthBounds: true
      });
    } else if(status){
      if(status === 'INVALID') {
        valid = false; 
      }
    }
    this.transferFormValidity = valid;
    return valid;
  }

  //constantly checks validity of entered fields
  transferDelayedValidation(event, fieldName: string){
    const el = event.target;
    const locker = this.transferDelayedChecker = {};
    setTimeout(() => {
      if (locker === this.transferDelayedChecker) {
        const ctrls = this.transferForm.controls;
        const ctrl = ctrls[fieldName];
        if (ctrl) {
          ctrl.setValue(el.value);
          this.transferForm.updateValueAndValidity();
        }
        this.transferFormCheck();
      }
    }, this.transferTimeDelay);
  }

  //handles transfers for UI
  async transferHandle(){
    if(this.transferInProgress) { return; }
    this.transferForm.updateValueAndValidity();
    if(this.transferFormValidity){
      //UI setup
      const modalRef = this.transferModal.focusTrap.parentElement;
      const modalContentRef = modalRef.getElementsByClassName('modal-dialog')[0];
      modalContentRef.classList.add('modal-noninteractable');
      this.transferInProgress = true;

      //transfer parameters
      const address = this.transferForm.controls.address.value;
      const tokenId = this.art.tokId;

      let result;
      try {
        result = await this.digitalArtsService.transfer(tokenId, address);

        //UI cleanup
        this.transferInProgress = false;
        modalContentRef.classList.remove('modal-noninteractable');
        this.transferModalShown = false;

        //success message
        this.transferResultModalMessage = 'Transfer successful';
        this.transferResultModalShown = true;
        this.transferResultModalData = JSON.stringify(result, null, this.transferMessageJsonIndentSpaces);
        this.transferResultModalShown = true;

        //removing possibility of transferring from account that is no longer owner of NFT
        const button = document.getElementById("transfer-button");
        button.remove();

        //changing owner on UI
        const owner = document.getElementById("owner");
        owner.textContent = address;

        //TODO: add re-rendering so there's no need to refresh the page to see result of transfer or manually remove the button and change the text content of owner
      } catch (err) {
        //UI cleanup
        this.transferInProgress = false;
        modalContentRef.classList.remove('modal-noninteractable');
        this.transferModalShown = false;

        //ideally should test later on for all possible cases of failure
        switch(this.digitalArtsService.error.code){
          case "INVALID_ARGUMENT":
            //Happens because account cannot be found
            this.transferResultModalMessage = "Account not on local blockchain";
            break;
          case "ACTION_REJECTED":
            this.transferResultModalMessage = "User cancelled transaction before signing";
            break;
          case -32603:
            // Todo: Extract the message from a json inside this.digitalArtsService.error.message
            if ((this.digitalArtsService.error.message).includes("Permission denied")) {
              this.transferResultModalMessage = 'Transfer failed due to lack of permissions';
            } else {
              this.transferResultModalMessage = 'Transfer failed because of following error';
            }
            break;
          default:
            this.transferResultModalMessage = 'Transfer failed because of following error';
            break;
        }
        
        //failure message
        this.transferResultHasError = true;
        this.transferResultModalData = JSON.stringify(this.digitalArtsService.error, null, this.transferMessageJsonIndentSpaces);
        this.transferResultModalShown = true;
      }
    }
  }

  transferFormReset(){
    this.transferForm.reset();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.transferFormSub) {
      this.transferFormSub.unsubscribe();
    }
  }

}