import { LocationStrategy } from "@angular/common";
import { Component, EventEmitter, HostListener, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { AlertDialogService } from "../../shared/alert-dialog/alert-dialog.service";
import { RetryService } from "../../shared/retry.service";
import { Util } from "../../util/util";
import { TranslateService } from "ng2-translate";

declare var MobileTicketAPI: any;
declare var ga: Function;

@Component({
  selector: "app-otp-pin",
  templateUrl: "./otp-pin.component.html",
  styleUrls: ["./otp-pin.component.css"],
})
export class OtpPinComponent implements OnInit {
  public pin: string = "";
  public pinError: boolean;
  public leftTime: number;
  public timeLeft: number = 5;
  public disableResend: string = "none";
  public showLoader = false;
  public showTimer = false;
  public invalidPinMsg_p: string;
  public invalidPinMsg_s: string;
  public clock;
  private _showNetWorkError = false;
  private otpTries: number = 0;
  

  @Output()
  showNetorkErrorEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private translate: TranslateService,
    private router: Router,
    private alertDialogService: AlertDialogService,
    private retryService: RetryService,
    private location: LocationStrategy
  ) {
    // preventing back button in browser
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

    this.translate.get('otp.pleaseWaitPrefix').subscribe((res: string) => {
      this.invalidPinMsg_p = res;
    });

    this.translate.get('otp.pleaseWaitSuffix').subscribe((res: string) => {
      this.invalidPinMsg_s = res;
    });
    
  }

  ngOnInit() {
    this.pinError = false;
    this.leftTime = this.timeLeft;
    this.timer();
  }

  public timer() {
    this.showTimer = true;
    this.clock = setInterval(() => {
      if (this.showTimer) {
        let minutes = Math.floor(this.leftTime / 60);
        let minutes_ = minutes.toString();
        if (minutes < 10) {
          minutes_ = "0" + minutes_;
        }
        let seconds = Math.floor(this.leftTime % 60);
        let seconds_ = seconds.toString();
        if (seconds < 10) {
          seconds_ = "0" + seconds;
        }
        if (this.leftTime < 1) {
          clearInterval(this.clock);
          this.timeUp();
        }
        if (this.leftTime == this.timeLeft - 10) {
          this.showResend();
        }
        document.getElementById("minute").innerHTML = minutes_;
        document.getElementById("seperator").innerHTML = ":";
        document.getElementById("second").innerHTML = seconds_;
        this.leftTime--;
      }
    }, 1000);
  }

  public onPinChanged() {
    this.pinError = false;
  }

  public onPhoneNumberEnter(event) {
    if (this.pinError && event.keyCode !== 13) {
      if (this.pin.trim() !== "") {
        this.pinError = false;
      }
    }
  }

  public timeUp() {
    // delete otp
    MobileTicketAPI.deleteOtp(
      MobileTicketAPI.getEnteredOtpPhoneNum(),
      (data) => {
        // console.log(data);
      },
      (err) => {
        // console.log(err);
      }
    );

    this.translate.get('otp.pinExpired').subscribe((res: string) => {
      this.alertDialogService.activate(res).then((res) => {
        this.router.navigate(["otp_number"]);
      });
    });

  }

  showResend(): void {
    this.disableResend = "auto";
  }

  public resend() {
    this.showLoader = true;
    this.disableResend = "none";
    this.otpTries = 0;
    MobileTicketAPI.resendOtp(
      MobileTicketAPI.getEnteredOtpPhoneNum(),
      (data) => {
        if (data == "OK") {
          this.showLoader = false;
          this.translate.get('otp.pinResend').subscribe((res: string) => {
            this.alertDialogService.activate(res);
          });
          this.pin = "";
          this.leftTime = this.timeLeft;
        } else {
          this.showLoader = false;
          this.pin = "";
          clearInterval(this.clock);
          this.translate.get('otp.lockedPhone').subscribe((res: string) => {
            this.alertDialogService.activate(res).then( data => {
              this.router.navigate(["otp_number"]);
            });
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public pinContinue() {
    if (this.pin.match(/^\(?\d?[-\s()0-9]{4,}$/) && this.pin.trim().length > 3) {
      // check pin
      this.showLoader = true;
      this.pin = this.pin.trim();
      this.otpTries++;
      MobileTicketAPI.checkOtp(
        this.pin,
        MobileTicketAPI.getEnteredOtpPhoneNum(),
        (data) => {
          if (data == "OK") {
            this.showLoader = false;
            this.showTimer = false;
            clearInterval(this.clock);
            // createVisit
            MobileTicketAPI.createVisit(
              (visitInfo) => {
                ga("send", {
                  hitType: "event",
                  eventCategory: "visit",
                  eventAction: "create",
                  eventLabel: "vist-create",
                });
                this.router.navigate(["ticket"]);
                // this.isTakeTicketClickedOnce = false;
              },
              (xhr, status, errorMessage) => {
                let util = new Util();
                // this.isTakeTicketClickedOnce = false;
                if (
                  util.getStatusErrorCode(
                    xhr && xhr.getAllResponseHeaders()
                  ) === "8042"
                ) {
                  this.translate
                    .get("error_codes.error_8042")
                    .subscribe((res: string) => {
                      this.alertDialogService.activate(res);
                    });
                } else if (
                  util.getStatusErrorCode(
                    xhr && xhr.getAllResponseHeaders()
                  ) === "11000"
                ) {
                  this.translate
                    .get("ticketInfo.visitAppRemoved")
                    .subscribe((res: string) => {
                      this.alertDialogService.activate(res);
                    });
                } else {
                  this.showHideNetworkError(true);
                  this.retryService.retry(() => {
                    /**
                     * replace this function once #140741231 is done
                     */
                    MobileTicketAPI.getBranchesNearBy(
                      0,
                      0,
                      2147483647,
                      () => {
                        this.retryService.abortRetry();
                        this.showHideNetworkError(false);
                      },
                      () => {
                        //Do nothing on error
                      }
                    );
                  });
                }
              }
            );
          } else {
            // otp not matched
            this.showLoader = false;
            if (this.otpTries < 3) {
              let alertMSg = this.invalidPinMsg_p + (3 - this.otpTries) + this.invalidPinMsg_s;
              this.alertDialogService.activate(alertMSg).then((res) => {
                this.pin = "";
              });
              
            } else {
              // 3rd try
              this.showLoader = true;
              clearInterval(this.clock);
              MobileTicketAPI.lockNumber(
                MobileTicketAPI.getEnteredOtpPhoneNum(),
                1, // 1 for exceeding wrong otp attempts
                (data) => {
                  if (data == "OK") {
                    this.showLoader = false;
                    this.translate.get('otp.lockedOtp').subscribe((res: string) => {
                      this.alertDialogService.activate(res).then( data => {
                        this.pin = "";
                        this.showTimer = false;
                        this.router.navigate(["otp_number"]);
                      });
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
        },
        (err) => {
          console.log(err);
        }
      );
    } else {
      this.pinError = true;
    }
  }

  showHideNetworkError(value: boolean) {
    this._showNetWorkError = value;
    this.showNetorkErrorEvent.emit(this._showNetWorkError);
  }

  get showNetWorkError(): boolean {
    return this._showNetWorkError;
  }

  @HostListener("window:beforeunload", ["$event"])
  showMessage($event) {
    $event.returnValue = "Your data will be lost!";
  }
}
