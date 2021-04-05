import { Component, OnInit } from '@angular/core';
import { BranchEntity } from '../entities/branch.entity';
import { ServiceEntity } from '../entities/service.entity';
import { TranslateService } from '@ngx-translate/core';
import { RetryService } from '../shared/retry.service';
import { AlertDialogService } from '../shared/alert-dialog/alert-dialog.service';
import { Config } from '../config/config';
import { Router } from '@angular/router';
import { Util } from '../util/util';
import { TicketEntity } from '../entities/ticket.entity';
declare var MobileTicketAPI: any;
declare var ga: Function;

enum phoneSectionStates {
  INITIAL,
  PRIVACY_POLICY,
  EDIT_PHONE
}

@Component({
  selector: 'app-customer-data',
  templateUrl: './customer-data.component.html',
  styleUrls: ['./customer-data.component.css']
})
export class CustomerDataComponent implements OnInit {
  public selectedBranch: BranchEntity;
  public selectedService: ServiceEntity;
  private _showNetWorkError = false;
  private isTakeTicketClickedOnce: boolean;
  public phoneNumber: string;
  public customerId: string;
  public phoneNumberError: boolean;
  public customerIdError: boolean;
  public customerIdMaxError: boolean;
  public phoneSectionState: phoneSectionStates;
  public phoneSectionStates = phoneSectionStates;
  public ticketEntity: TicketEntity;
  public documentDir: string;
  public countryCode: string;
  public countryCodePrefix: string;
  public isPrivacyEnable = 'disable';
  public activeConsentEnable = 'disable';
  public showLoader = false;
  public seperateCountryCode = false;
  public changeCountry = false;
  public submitClicked = false;
  public isCustomerPhoneDataEnabled = false;
  public isCustomerIdEnabled = false;

  constructor(
    private translate: TranslateService,
    public router: Router,
    private retryService: RetryService,
    private alertDialogService: AlertDialogService,
    private config: Config
  ) { }

  ngOnInit() {
    this.getSelectedBranch();
    this.getSelectedServices();
    this.countryCode = this.config.getConfig("country_code").trim();
    if (this.countryCode.match(/^[A-Za-z]+$/)) {
      this.seperateCountryCode = true;
    } else {
      if (this.countryCode === "") {
        this.countryCode = "+";
      }
    }

    this.phoneNumberError = false;
    this.customerIdError = false;
    this.customerIdMaxError = false;
    this.phoneSectionState = phoneSectionStates.INITIAL;
    this.isPrivacyEnable = this.config.getConfig('privacy_policy');
    this.activeConsentEnable = this.config.getConfig('active_consent');
    this.phoneNumber = MobileTicketAPI.getEnteredPhoneNum();
    this.customerId = MobileTicketAPI.getEnteredCustomerId() ? MobileTicketAPI.getEnteredCustomerId() : '';
    MobileTicketAPI.setPhoneNumber('');
    MobileTicketAPI.setCustomerId('');
    this.isCustomerPhoneDataEnabled = this.config.getConfig('customer_data').phone_number.value === 'enable' ? true : false;   
    this.isCustomerIdEnabled =  this.config.getConfig('customer_data').customerId.value === 'enable' ? true : false;  
    if (this.phoneNumber && (this.phoneNumber !== this.countryCode) && this.activeConsentEnable === 'enable') {
      this.phoneSectionState = phoneSectionStates.PRIVACY_POLICY;
    }
    if (document.dir == "rtl") {
      this.documentDir = "rtl";
    }
  }

  // Press continue button for phone number
  CustomerInfoContinue() {
    // If customer phone data enabled
    if (this.isCustomerPhoneDataEnabled) {
      // is phone matches
      if (this.phoneNumber.match(/^\(?\+?\d?[-\s()0-9]{6,}$/) && this.phoneNumber !== this.countryCode) {
        let isPrivacyAgreed = localStorage.getItem('privacy_agreed');
        MobileTicketAPI.setPhoneNumber(this.phoneNumber);
        if (this.customerId.trim() !== '' && this.customerId.length > 255) {
          this.customerIdMaxError = true;
        } else {
          if (this.customerId.trim() !== '') {
            MobileTicketAPI.setCustomerId(encodeURIComponent(this.customerId.toString().trim()));
          }
          if (isPrivacyAgreed === 'true' || this.isPrivacyEnable !== 'enable' || this.activeConsentEnable !== 'enable') {
            this.createVisit()
          } else {
            this.phoneSectionState = phoneSectionStates.PRIVACY_POLICY;
          }
        }

    // phone not matching phone and no phone number
    } else if (this.customerId.trim() !== '' && this.phoneNumber.trim() == '') {
      if (this.customerId.length > 255) {
        this.customerIdMaxError = true;
      } else {
      MobileTicketAPI.setCustomerId(encodeURIComponent(this.customerId.toString().trim()));
      this.createVisit()
      }
    }  
    // if not matching phone and phone number exists
    else {
      this.phoneNumberError = true;
      if (this.customerId.length > 255) {
        this.customerIdError = true;
      } else if (this.customerId.trim() === '' && this.phoneNumber.trim() == '') {
        this.customerIdError = true;
      }
      
    }
    }
    // If customer phone data is disabled and only customer id is enabled
    else if (this.customerId.trim() !== '') {
      if (this.customerId.length > 255) {
        this.customerIdMaxError = true;
      } else {
      MobileTicketAPI.setCustomerId(encodeURIComponent(this.customerId.toString().trim()));
      this.createVisit()
      }
    }
    // if no customer id
    else {
      this.customerIdError = true;
    }
   

  }
  // Change phone number input feild
  onPhoneNumberChanged() {
    this.phoneNumberError = false;
    this.customerIdError = false;
    // this.changeCountry = false;
    this.submitClicked = false;
  }
  onCustomerIdChanged() {
    this.customerIdError = false;
    this.phoneNumberError = false;
    this.customerIdMaxError = false;
  }

  onCustomerIdChangedEnter(event){
    if (this.customerId && event.keyCode !== 13) {
      this.customerIdError = false;
      this.phoneNumberError = false;
      this.customerIdMaxError = false;
    }
  }
  onPhoneNumberEnter(event) {
    // console.log(event.keycode);
    if (this.phoneNumberError && event.keyCode !== 13) {
      if (this.phoneNumber.trim() !== '') {
        this.customerIdError = false;
        this.phoneNumberError = false;
        this.customerIdMaxError = false;
      }
    }
  }
  // understood button pressed
  understoodPrivacyConsent() {
    localStorage.setItem('privacy_agreed', 'true');
    MobileTicketAPI.setPhoneNumber(this.phoneNumber);
    this.createVisit();
  }

  skipAndcreateVisit() {
    MobileTicketAPI.setPhoneNumber('');
    if (this.customerId) {
      MobileTicketAPI.setCustomerId(encodeURIComponent(this.customerId.toString().trim()));
      this.createVisit()
    } else {
      this.createVisit();
    }    
  }


  getSelectedBranch() {
    this.selectedBranch = MobileTicketAPI.getSelectedBranch();

  }
  getSelectedServices() {
    this.selectedService = MobileTicketAPI.getSelectedService();
  }
  // creating  visit
  createVisit() {
    if (!this.isTakeTicketClickedOnce) {
      this.isTakeTicketClickedOnce = true;
      let visitInfo = MobileTicketAPI.getCurrentVisit();
      if (visitInfo && visitInfo !== null && visitInfo.visitStatus !== "DELETE") {
        this.router.navigate(['ticket']);
      } else {
        let isDeviceBounded = this.config.getConfig('block_other_browsers');
        if (isDeviceBounded === 'enable') {
          import('fingerprintjs2').then(Fingerprint2 => {
            var that = this;
            Fingerprint2.getPromise({
              excludes: {
                availableScreenResolution: true,
                adBlock: true,
                enumerateDevices: true
              }
            }).then(function (components) {
              var values = components.map(function (component) { return component.value });
              var murmur = Fingerprint2.x64hash128(values.join(''), 31);
              MobileTicketAPI.setFingerprint(murmur);
              that.createTicket();
            })
          });
        } else {
          this.createTicket();
        }
      }
    }
  }

  public createTicket() {
    let OtpService = this.config.getConfig('otp_service');
    if (OtpService === 'enable') {
      this.router.navigate(['otp_number']);
    }
    else {
      this.showLoader = true;
      MobileTicketAPI.createVisit(
        (visitInfo) => {
          ga('send', {
            hitType: 'event',
            eventCategory: 'visit',
            eventAction: 'create',
            eventLabel: 'vist-create'
          });
          this.showLoader = false;
          this.router.navigate(['ticket']);
          this.isTakeTicketClickedOnce = false;
        },
        (xhr, status, errorMessage) => {
          this.showLoader = false;
          let util = new Util();
          this.isTakeTicketClickedOnce = false;
          if (util.getStatusErrorCode(xhr && xhr.getAllResponseHeaders()) === "8042") {
            this.translate.get('error_codes.error_8042').subscribe((res: string) => {
              this.alertDialogService.activate(res);
            });
          } else if (util.getStatusErrorCode(xhr && xhr.getAllResponseHeaders()) === "11000") {
            this.translate.get('ticketInfo.visitAppRemoved').subscribe((res: string) => {
              this.alertDialogService.activate(res);
            });
          } else if (errorMessage === 'Gateway Timeout') {
            this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
              this.alertDialogService.activate(res);
            });
          } else {
            this.showHideNetworkError(true);
            this.retryService.retry(() => {

              /**
              * replace this function once #140741231 is done
              */
              MobileTicketAPI.getBranchesNearBy(0, 0, 2147483647,
                () => {
                  this.retryService.abortRetry();
                  this.showHideNetworkError(false);
                }, () => {
                  //Do nothing on error
                  this.router.navigate(['no_visit']);
                });
            });
          }
        }
      );
    }
  }

  phoneNumberFeildFocused() {
    if (this.phoneNumber === '' || this.phoneNumber === undefined ) {
      this.phoneNumber = this.countryCode;
    }
  }
  phoneNumberFeildUnfocused() {
    if (this.phoneNumber === this.countryCode) {
      this.phoneNumber = '';
    }
  }
  showHideNetworkError(value: boolean) {
    this._showNetWorkError = value;
  }
  privacyLinkButtonPressed() {
    var isLink = this.config.getConfig('privacy_policy_link');
    if (isLink !== '') {
      window.open(isLink, "_blank", '');
    } else {
      MobileTicketAPI.setPhoneNumber(this.phoneNumber);
      this.router.navigate(['privacy_policy']);
    }
  }
  get showNetWorkError(): boolean {
    return this._showNetWorkError;
  }

  telInputObject(obj){
    obj.setCountry(this.countryCode);
  }

  hasError(e){
    this.phoneNumberError = e ? false:true;
    
    if(this.submitClicked){
      this.phoneNumberError = e ? false:true;
    }
  }

  getNumber(e){
    this.phoneNumber = e;
    // this.phoneNumContinue();

    if(this.submitClicked){ 
      this.CustomerInfoContinue();
    }
  }

  onCountryChange(e){
    this.phoneNumberError = false;
    this.submitClicked = false;    
    MobileTicketAPI.setCountryFlag(e.iso2);
  }

  submitByBtn(e){
    this.submitClicked = true;
    if(!this.phoneNumberError){
      this.CustomerInfoContinue();
    }
    // e.target.blur();
  }

  submitByKey(e){
    if(e.code === 'Enter'){
      this.submitClicked = true; 
    }
  }
  

}
