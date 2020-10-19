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
  public counterTime: number = 180;
  public disableResend: boolean = true;
  public showLoader = false;
  public showTimer = false;
  public invalidOTP: string;
  public clock;
  private _showNetWorkError = false;
  private smsText: string;
  

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

    this.translate.get('otp.invalidOTP').subscribe((res: string) => {
      this.invalidOTP = res;
    });

    this.translate.get('otp.smsText').subscribe((res: string) => {
        this.smsText = res;
    });
    
  }

  ngOnInit() {
    this.pinError = false;
    this.leftTime = MobileTicketAPI.getOTPleftTime() ? MobileTicketAPI.getOTPleftTime() : this.counterTime;
    if (this.leftTime <= (this.counterTime-10)) {
      this.showResend();
    }
    this.showTimer = true;
    this.timer();
  }

  public timer() {
    // this.showTimer = true;
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
        if (this.leftTime == this.counterTime - 10) {
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
    this.showLoader = false;
    MobileTicketAPI.deleteOTP(
      MobileTicketAPI.getEnteredOtpPhoneNum(),
      (data) => {
        this.translate.get('otp.pinExpired').subscribe((res: string) => {
          this.alertDialogService.activate(res);
          this.pin = '';
          this.router.navigate(["otp_number"]);
        });
      },
      (err) => {
        this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
          this.alertDialogService.activate(res);
          MobileTicketAPI.setOtpPhoneNumber("");
          this.pin = '';
          this.router.navigate(["branches"]);
        });
      }
    );

    

  }

  showResend(): void {
    this.disableResend = false;
  }

  public resend() {
    this.showLoader = true;
    this.disableResend = true;
    clearInterval(this.clock);
    MobileTicketAPI.resendOTP(
      MobileTicketAPI.getEnteredOtpPhoneNum(), this.smsText,
      (data) => {
        if (data == "OK") {
          this.showLoader = false;
          this.translate.get('otp.pinResend').subscribe((res: string) => {
            this.alertDialogService.activate(res);
          });
          this.pin = "";
          this.leftTime = this.counterTime;
          this.showTimer = true;
          this.timer();
        } else {
          this.showLoader = false;
          this.pin = "";
          clearInterval(this.clock);
          this.translate.get('otp.lockedPhone').subscribe((res: string) => {
            this.alertDialogService.activate(res);
            this.router.navigate(["otp_number"]);
          });
        }
      },
      (err) => { 
        this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
          this.alertDialogService.activate(res);
          this.showLoader = false;
          MobileTicketAPI.setOtpPhoneNumber("");
          this.pin = '';
          clearInterval(this.clock);
          this.router.navigate(["branches"]);
        });
      }
    );
  }

  public pinContinue() {
    if (this.pin.match(/^\(?\d?[-\s()0-9]{4,}$/) && this.pin.trim().length > 3) {
      // check pin
      this.showLoader = true;
      clearInterval(this.clock);
      const clickTime = Date.now();  
      this.pin = this.pin.trim();
      MobileTicketAPI.checkOTP(
        this.pin,
        MobileTicketAPI.getEnteredOtpPhoneNum(),
        (data) => {
          if (data == "OK") {
            this.showLoader = false;  
            // createVisit
            MobileTicketAPI.createVisit(
              (visitInfo) => {
                ga("send", {
                  hitType: "event",
                  eventCategory: "visit",
                  eventAction: "create",
                  eventLabel: "vist-create",
                });
                clearInterval(this.clock);
                this.showTimer = false;
                
                // delete otp 
                MobileTicketAPI.deleteOTP(
                  MobileTicketAPI.getEnteredOtpPhoneNum(),
                  (data) => {
                    MobileTicketAPI.setOtpPhoneNumber("");
                  },
                  (err) => {
                    this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
                      this.alertDialogService.activate(res);
                      MobileTicketAPI.setOtpPhoneNumber("");
                      this.router.navigate(["branches"]);
                    });
                  }
                );
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
            this.showLoader = false;
            if (data.tries<3) {
              let alertMSg = this.invalidOTP;
              const remainingTries = 3 - data.tries;
              alertMSg = alertMSg.replace('#', remainingTries.toString());
              this.alertDialogService.activate(alertMSg);
              this.pin = "";
              this.showTimer = false;
              const timeDif = Math.ceil((Date.now()-clickTime)/1000);
              this.leftTime = this.leftTime - timeDif;
              if (this.leftTime>0) { 
                this.timer();
                this.showTimer = true;
              } else {
                this.timeUp();
              }
              
            } else {
              this.showLoader = true;
              clearInterval(this.clock);
              MobileTicketAPI.lockNumber(
                MobileTicketAPI.getEnteredOtpPhoneNum(),
                1, // 1 for exceeding wrong otp tries
                (data) => {
                  if (data == "OK") {
                    this.showLoader = false;
                    this.translate.get('otp.lockedOtp').subscribe((res: string) => {
                      this.alertDialogService.activate(res);
                      this.pin = "";
                      this.showTimer = false;
                      this.router.navigate(["otp_number"]);
                    });
                  } else {
                    this.showLoader = false;
                    this.pin = "";
                    this.showTimer = false;
                    this.router.navigate(["otp_number"]);
                  }
                },
                (err) => {
                  
                  this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
                    this.alertDialogService.activate(res);
                    this.showLoader = false;
                    this.showTimer = false;
                    MobileTicketAPI.setOtpPhoneNumber("");
                    this.pin = '';
                    this.router.navigate(["branches"]);
                  });
                }
              );
            }
          }
        },
        (err) => {
          
          this.translate.get('connection.issue_with_connection').subscribe((res: string) => {
            this.alertDialogService.activate(res);
            this.showLoader = false;
            this.showTimer = false;
            this.pin = '';
            clearInterval(this.clock);
            MobileTicketAPI.setOtpPhoneNumber("");
            this.router.navigate(["branches"]);
          });
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
