import { LocationStrategy } from "@angular/common";
import { Component, EventEmitter, HostListener, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { AlertDialogService } from "../../shared/alert-dialog/alert-dialog.service";
import { TranslateService } from "@ngx-translate/core";
import { Config } from "../../config/config";

declare var MobileTicketAPI: any;

@Component({
  selector: "app-otp-phone-number",
  templateUrl: "./otp-phone-number.component.html",
  styleUrls: ["./otp-phone-number.component.css"],
})
export class OtpPhoneNumberComponent implements OnInit {
  public phoneNumber: string = '';
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
    this.countryCode = this.config.getConfig("country_code").trim();
    if (this.countryCode.match(/^[A-Za-z]+$/)) {
      this.seperateCountryCode = true;
    } else {
      if (this.countryCode === "") {
        this.countryCode = "+";
      }
    }

    this.phoneNumber = MobileTicketAPI.getEnteredOtpPhoneNum()
      ? MobileTicketAPI.getEnteredOtpPhoneNum()
      : MobileTicketAPI.getEnteredPhoneNum();
    if(!this.phoneNumber){
      this.phoneNumber = '';
    }

    MobileTicketAPI.setOtpPhoneNumber("");

    this.phoneNumberError = false;
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
    if (this.phoneNumberError && event.keyCode !== 13) {
      if (this.phoneNumber.trim() !== "") {
        this.phoneNumberError = false;
      }
    }
  }

  onPhoneNumberChanged() {
    this.phoneNumberError = false;
    this.submitClicked = false;
  }

  phoneNumContinue() {    
    if (this.phoneNumber.trim().length > 5 &&
      this.phoneNumber.match(/^\(?\+?\d?[-\s()0-9]{6,}$/) &&
      this.phoneNumber !== this.countryCode 
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
              this.router.navigate(["branches"]);
            });
          }
        },
        (err) => {
          this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
            this.alertDialogService.activate(res);
            this.showLoader = false;
            MobileTicketAPI.setOtpPhoneNumber("");
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

  @HostListener('window:beforeunload',['$event'])
  showMessage($event) { 
    $event.returnValue='Your data will be lost!';
  }

  telInputObject(obj){
    if(MobileTicketAPI.getCountryFlag() !== undefined){
      obj.setCountry(MobileTicketAPI.getCountryFlag());
    } else { 
      obj.setCountry(this.countryCode);
    }
  }

  hasError(e){
    console.log(e);
    this.phoneNumberError = e ? false:true;
    
    if(this.submitClicked){
      this.phoneNumberError = e ? false:true;
    }
  }

  getNumber(e){
    this.phoneNumber = e;
    // this.phoneNumContinue();

    if(this.submitClicked){ 
      this.phoneNumContinue();
    }
  }

  onCountryChange(e){
    this.phoneNumberError = false;
    this.submitClicked = false;
  }

  submitByBtn(e){
    if(this.phoneNumber.length === 0){
      this.phoneNumberError = true;
    }
    this.submitClicked = true;
    if(!this.phoneNumberError){
      this.phoneNumContinue();
    }
    // e.target.blur();
  }

  submitByKey(e){
    if(e.code === 'Enter'){
      this.submitClicked = true; 
    }
  }
}
