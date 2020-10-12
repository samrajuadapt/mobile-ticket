import { LocationStrategy } from "@angular/common";
import { Component, HostListener, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AlertDialogService } from "../../shared/alert-dialog/alert-dialog.service";
import { TranslateService } from "ng2-translate";
import { Config } from "../../config/config";

declare var MobileTicketAPI: any;

@Component({
  selector: "app-otp-phone-number",
  templateUrl: "./otp-phone-number.component.html",
  styleUrls: ["./otp-phone-number.component.css"],
})
export class OtpPhoneNumberComponent implements OnInit {
  public phoneNumber: string;
  public phoneNumberError: boolean;
  public countryCode: string;
  public showLoader = false;

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
  }

  ngOnInit() {
    // if(MobileTicketAPI.getEnteredOtpPhoneNum()){
    //   this.alertDialogService.activate("Your token is expired").then(res => {});
    // }

    this.countryCode = this.config.getConfig("country_code");
    if (this.countryCode === "") {
      this.countryCode = "+";
    }

    this.phoneNumber = MobileTicketAPI.getEnteredOtpPhoneNum()
      ? MobileTicketAPI.getEnteredOtpPhoneNum()
      : MobileTicketAPI.getEnteredPhoneNum();

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
    // console.log(event.keycode);
    if (this.phoneNumberError && event.keyCode !== 13) {
      if (this.phoneNumber.trim() !== "") {
        this.phoneNumberError = false;
      }
    }
  }

  onPhoneNumberChanged() {
    this.phoneNumberError = false;
  }

  phoneNumContinue() {
    if (
      this.phoneNumber.match(/^\(?\+?\d?[-\s()0-9]{6,}$/) &&
      this.phoneNumber !== this.countryCode
    ) {
      this.showLoader = true; // make submit button disable
      MobileTicketAPI.setOtpPhoneNumber(this.phoneNumber);
      MobileTicketAPI.getOtp(
        this.phoneNumber,
        (data) => {
          if (data == "OK") {
            this.showLoader = false;
            this.router.navigate(["otp_pin"]);
          } else if(data == "Already Reported") {
            this.alertDialogService.activate("You have to wait for a while").then(res => {
              this.showLoader = false;
            }); 
          }
        },
        (err) => {
          console.log(err);
        }
      );
    } else {
      this.phoneNumberError = true;
    }
  }

  @HostListener('window:beforeunload',['$event'])
  showMessage($event) { 
    $event.returnValue='Your data will be lost!';
  }
}
