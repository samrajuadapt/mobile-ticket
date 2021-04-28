import { LocationStrategy } from "@angular/common";
import { AfterViewInit, Component, EventEmitter, HostListener, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { AlertDialogService } from "../../shared/alert-dialog/alert-dialog.service";
import { TranslateService } from "@ngx-translate/core";
import { Config } from "../../config/config";
import { CountryISO, SearchCountryField } from "ngx-intl-tel-input";
import { FormControl, FormGroup, Validators } from "@angular/forms";

declare var MobileTicketAPI: any;

@Component({
  selector: "app-otp-phone-number",
  templateUrl: "./otp-phone-number.component.html",
  styleUrls: ["./otp-phone-number.component.css"],
})
export class OtpPhoneNumberComponent implements OnInit, AfterViewInit {
  public phoneNumber: string = '';
  public phoneNumberObject: any;
  public phoneNumberError: boolean;
  public countryCode: string;
  public showLoader = false;
  public counterTime: number = 180;
  private _showNetWorkError = false;
  private smsText: string;
  public seperateCountryCode = false;
  public changeCountry = false;
  public submitClicked = false;
  public countryCodePrefix: string;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public selectedCountryISO = '';
  public preferredCountries: CountryISO[] = [CountryISO.SriLanka, CountryISO.Sweden];
  phoneForm = new FormGroup({
    phone: new FormControl(undefined, [Validators.required])
  });
  public prefferedCountryCodeList: string[];
  public prefferedCountries: string;
  @Output()
  showNetorkErrorEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private config: Config,
    private translate: TranslateService,
    private router: Router,
    private alertDialogService: AlertDialogService,
    private location: LocationStrategy
  ) {
    // preventing back button in browser
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
    MobileTicketAPI.setOTPleftTime(undefined);
    this.translate.get('otp.smsText').subscribe((res: string) => {
        this.smsText = res;
    });
  }

  ngOnInit() {
    this.countryCode = this.config.getConfig('country_code').trim();
    // prepare preffered country codes
    this.prefferedCountries = this.config.getConfig('preffered_country_list');
    this.prefferedCountryCodeList = this.prefferedCountries.split(',');
    this.prefferedCountryCodeList = [...new Set(this.prefferedCountryCodeList)];
    const countryCodeValues = Object.values(CountryISO);
    this.prefferedCountryCodeList = this.prefferedCountryCodeList.filter(country => countryCodeValues.includes(country as CountryISO));

    if (this.countryCode.match(/^[A-Za-z]+$/)) {
      if (countryCodeValues.includes(this.countryCode as CountryISO)) {
        this.selectedCountryISO = this.countryCode;
      } else {
        this.selectedCountryISO = '';
      }
      this.seperateCountryCode = true;
    } else {
      if (this.countryCode === '') {
        this.countryCode = '+';
      }
    }

    this.phoneNumber = MobileTicketAPI.getEnteredOtpPhoneNum()
      ? MobileTicketAPI.getEnteredOtpPhoneNum()
      : MobileTicketAPI.getEnteredPhoneNum();
    if (!this.phoneNumber) {
      this.phoneNumber = '';
    }

    if (this.seperateCountryCode) {
      this.phoneNumberObject = MobileTicketAPI.getEnteredOtpPhoneNumObj()
      ? MobileTicketAPI.getEnteredOtpPhoneNumObj()
      : MobileTicketAPI.getEnteredPhoneNumObj();
    }
    if (this.phoneNumberObject) {
      this.selectedCountryISO = this.phoneNumberObject.countryCode;
    }

    MobileTicketAPI.setOtpPhoneNumber('');
    if (this.seperateCountryCode) { MobileTicketAPI.setOtpPhoneNumberObj({}) }
    this.phoneNumberError = false;
  }

  ngAfterViewInit() {
    if (this.seperateCountryCode) {
      const phoneContainer = document.getElementsByClassName('customer-phone__number-container');
      for (const div of Object.keys(phoneContainer)) {
        phoneContainer[div].style.cssText = 'height:66px';
      }
    }
  }

  dropDownClicked() {
    const coutryDropDowns = document.getElementsByClassName('iti__country-list');
    const divs = document.getElementsByClassName('iti-sdc-3');
    const searchBox = document.getElementById('country-search-box');
    if (searchBox) {
      searchBox.style.cssText = 'padding: 6px 5px 6px 9px;font-size: 14px;';
    }
    if (document.dir === 'rtl') {
      for (const dropDown of Object.keys(coutryDropDowns)) {
        coutryDropDowns[dropDown].style.cssText = 'margin-left: 0px !important;margin-right: 0px !important;font-size: 10.85px;white-space:none !important';
      }
    } else {
      for (const dropDown of Object.keys(coutryDropDowns)) {
        coutryDropDowns[dropDown].style.cssText = 'margin-left: 0px !important;margin-right: 0px !important;font-size: larger;white-space:none !important';
      }
    }
    for (const div of Object.keys(divs)) {
      divs[div].style.cssText = 'position:fixed';
    }
  }

  phoneNumberFeildFocused() {
    if (this.phoneNumber === "" || this.phoneNumber === undefined) {
      this.phoneNumber = this.countryCode;
    }
  }

  phoneNumberFeildUnfocused() {
    if (this.phoneNumber === this.countryCode) {
      this.phoneNumber = "";
    }
  }

  onPhoneNumberEnter(event) {
    this.setPhoneNumber();
    if (this.seperateCountryCode) {
      const error = document.getElementsByClassName('phone-num-error');
      for (const div of Object.keys(error)) {
        error[div].style.cssText = 'margin-top: 12px;';
      }
    }
    if (this.phoneNumberError && event.keyCode !== 13) {
      if (this.phoneNumber.trim() !== "") {
        this.phoneNumberError = false;
      }
    }
  }

  setPhoneNumber() {
    if (this.seperateCountryCode && this.phoneNumberObject) {
      this.phoneNumberError = !this.phoneForm.valid;
      this.phoneNumber = this.phoneNumberObject.e164Number;
    }
  }

  onPhoneNumberChanged() {
    this.phoneNumberError = false;
    this.submitClicked = false;
  }

  phoneNumContinue() {
    this.setPhoneNumber();
    if (this.phoneNumber.trim().length > 5 &&
      this.phoneNumber.match(/^\(?\+?\d?[-\s()0-9]{6,}$/) &&
      this.phoneNumber !== this.countryCode && !this.phoneNumberError
    ) {
      this.showLoader = true;
      this.phoneNumber = this.phoneNumber.trim();
      if( this.phoneNumber[0]=='+'){
        this.phoneNumber = this.phoneNumber.slice(1);
      }
      if( this.phoneNumber.slice(0,2)=='00'){
        this.phoneNumber = this.phoneNumber.slice(2);
      }


      MobileTicketAPI.setOtpPhoneNumber(this.phoneNumber);
      if (this.seperateCountryCode) { MobileTicketAPI.setOtpPhoneNumberObj(this.phoneNumberObject) }
      MobileTicketAPI.sendOTP(
        this.phoneNumber, this.smsText,
        (data) => {
          this.showLoader = false;
          if (data == "OK") {
            this.router.navigate(["otp_pin"]);
          } else if (data.phoneNumber == this.phoneNumber) {
            if (data.attempts > 2) {
              this.translate.get('otp.pleaseWait').subscribe((res: string) => {
                this.alertDialogService.activate(res);
                this.router.navigate(["otp_number"]);
              });
            } else if (data.tries > 2) {
              this.translate.get('otp.pleaseWait').subscribe((res: string) => {
                this.alertDialogService.activate(res);
                this.router.navigate(["otp_number"]);
              });
            } else {
              const now = Date.now();
              const updatedAt = Date.parse(data.lastUpdated);   
              const timeDif = Math.ceil((now-updatedAt)/1000);
              if(timeDif <= this.counterTime) {
                MobileTicketAPI.setOTPleftTime(this.counterTime - timeDif);
                this.translate.get('otp.havePIN').subscribe((res: string) => {
                  this.alertDialogService.activate(res);
                  this.router.navigate(["otp_pin"]);
                });
              } else {
                MobileTicketAPI.deleteOTP(
                  data.phoneNumber,
                  (data) => {
                    this.translate.get('otp.pinExpired').subscribe((res: string) => {
                      this.alertDialogService.activate(res);
                      this.router.navigate(["otp_number"]);
                    });
                  },
                  (err) => {
                    this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
                      this.alertDialogService.activate(res);
                      MobileTicketAPI.setOtpPhoneNumber("");
                      if (this.seperateCountryCode) { MobileTicketAPI.setOtpPhoneNumberObj({}) }
                      this.router.navigate(["branches"]);
                    });
                  }
                );
              }  
            } 
          } else {
            this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
              this.alertDialogService.activate(res);
              MobileTicketAPI.setOtpPhoneNumber("");
              if (this.seperateCountryCode) { MobileTicketAPI.setOtpPhoneNumberObj({}) }
              this.router.navigate(["branches"]);
            });
          }
        },
        (err) => {
          this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
            this.alertDialogService.activate(res);
            this.showLoader = false;
            MobileTicketAPI.setOtpPhoneNumber("");
            if (this.seperateCountryCode) { MobileTicketAPI.setOtpPhoneNumberObj({}) }
            this.router.navigate(["branches"]);
          });
        }
      );
    } else {
      this.phoneNumberError = true;
    }
  }

  showHideNetworkError(value: boolean) {
    this._showNetWorkError = value;
    this.showNetorkErrorEvent.emit(this._showNetWorkError);
  }

  get showNetWorkError(): boolean {
    return this._showNetWorkError;
  }

  @HostListener('window:beforeunload', ['$event'])
  showMessage($event) {
    $event.returnValue = 'Your data will be lost!';
  }

  // telInputObject(obj){
  //   if(MobileTicketAPI.getCountryFlag() !== undefined){
  //     obj.setCountry(MobileTicketAPI.getCountryFlag());
  //   } else {
  //     obj.setCountry(this.countryCode);
  //   }
  // }

  // hasError(e){
  //   console.log(e);
  //   this.phoneNumberError = e ? false:true;
  //   if(this.submitClicked){
  //     this.phoneNumberError = e ? false:true;
  //   }
  // }

  // getNumber(e){
  //   this.phoneNumber = e;
  //   // this.phoneNumContinue();

  //   if(this.submitClicked){ 
  //     this.phoneNumContinue();
  //   }
  // }

  // onCountryChange(e){
  //   this.phoneNumberError = false;
  //   this.submitClicked = false;
  // }

  // submitByBtn(e){
  //   if(this.phoneNumber.length === 0){
  //     this.phoneNumberError = true;
  //   }
  //   this.submitClicked = true;
  //   if(!this.phoneNumberError){
  //     this.phoneNumContinue();
  //   }
  //   // e.target.blur();
  // }

  // submitByKey(e){
  //   if(e.code === 'Enter'){
  //     this.submitClicked = true; 
  //   }
  // }
}
