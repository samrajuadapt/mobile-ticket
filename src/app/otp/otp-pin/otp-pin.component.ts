import { LocationStrategy } from "@angular/common";
import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Config } from '../../config/config';
import { AlertDialogService } from "../../shared/alert-dialog/alert-dialog.service";
import { RetryService } from "../../shared/retry.service";
import { Util } from "../../util/util";
import { TranslateService } from "ng2-translate";
import { min } from "rxjs/operator/min";

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
  public timerColor: string = "#fff";
  public leftTime: number;
  public timeLeft: number = 180;
  public disableResend: string = "none";
  public showLoader = false;
  public showTimer = false;
  private _showNetWorkError = false;
  private otpTries: number = 0;

  @Output()
  showNetorkErrorEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private config: Config,
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
  }

  ngOnInit() {
    this.timerColor = this.config.getConfig("otp_timer_color");
    this.pinError = false;
    this.leftTime = this.timeLeft;
    this.timer();
  }

  public timer() {
    this.showTimer = true;
    let timer = setInterval(() => {
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
          clearInterval(timer);
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
    // console.log(event.keycode);
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
        console.log(data);
      },
      (err) => {
        console.log(err);
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
    MobileTicketAPI.resendOtp(
      MobileTicketAPI.getEnteredOtpPhoneNum(),
      (data) => {
        if (data == "OK") {
          this.showLoader = false;
          this.alertDialogService
            .activate("The PIN will be resent")
            .then((res) => {});
          this.pin = "";
          this.leftTime = this.timeLeft;
        } else {
          console.log(11);
          this.showLoader = false;
          this.pin = "";
          this.alertDialogService
            .activate(
              "Please wait 10 minutes before trying to resend the PIN again"
            )
            .then((res) => {
              this.router.navigate(["otp_number"]);
            });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public pinContinue() {
    if (this.pin.match(/^\(?\d?[-\s()0-9]{4,}$/)) {
      // check pin
      this.showLoader = true;
      this.otpTries++;
      MobileTicketAPI.checkOtp(
        this.pin,
        MobileTicketAPI.getEnteredOtpPhoneNum(),
        (data) => {
          console.log(data);

          if (data == "OK") {
            this.showLoader = false;
            this.showTimer = false;
            // createVisit
            MobileTicketAPI.setOtpPhoneNumber("");
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
              let alertMessage =
                "The PIN you entered is invalid. You have " +
                (3 - this.otpTries) +
                " left";
              this.alertDialogService.activate(alertMessage).then((res) => {
                this.pin = "";
              });
            } else {
              // 3rd try
              this.showLoader = true;
              let alertMessage =
                "No attempts left. Please wait 3 minutes and try again";
              MobileTicketAPI.lockNumber(
                MobileTicketAPI.getEnteredOtpPhoneNum(),
                1, // 1 for exceeding wrong otp attempts
                (data) => {
                  if (data == "OK") {
                    this.showLoader = false;
                    this.alertDialogService
                      .activate(alertMessage)
                      .then((res) => {
                        this.pin = "";
                        this.router.navigate(["otp_number"]);
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
