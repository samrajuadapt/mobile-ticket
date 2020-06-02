import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TicketEntity } from '../../entities/ticket.entity';
import { Router } from '@angular/router';
import { Util } from '../../util/util';
import { TranslateService } from 'ng2-translate';
import { RetryService } from '../../shared/retry.service';
import { AlertDialogService } from '../../shared/alert-dialog/alert-dialog.service';
import { Config } from '../../config/config';

enum phoneSectionStates {
  INITIAL,
  PRIVACY_POLICY,
  EDIT_PHONE
}

declare var MobileTicketAPI: any;
declare var ga: Function;

@Component({
  selector: 'app-cutomer-phone',
  templateUrl: './cutomer-phone.component.html',
  styleUrls: ['./cutomer-phone.component.css']
})
export class CutomerPhoneComponent implements OnInit {
  public phoneNumber: string;
  public phoneNumberError: boolean;
  public phoneSectionState: phoneSectionStates;
  public phoneSectionStates = phoneSectionStates;
  public ticketEntity: TicketEntity;
  private _showNetWorkError = false;
  public documentDir: string;
  public countryCode: string;

  @Output()
  showNetorkErrorEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  constructor(
    public router: Router,
    private translate: TranslateService,
    private retryService: RetryService,
    private alertDialogService: AlertDialogService,
    private config: Config
  ) { }

  ngOnInit() {
    this.countryCode = this.config.getConfig('country_code');
    if (this.countryCode === '') {
      this.countryCode = '+';
    }

    this.phoneNumberError = false;
    this.phoneSectionState = phoneSectionStates.INITIAL;
    this.phoneNumber = MobileTicketAPI.getEnteredPhoneNum();
    if (this.phoneNumber && (this.phoneNumber !== this.countryCode)) {
      this.phoneSectionState = phoneSectionStates.PRIVACY_POLICY;
    } else {
      this.phoneNumber = '';
    }
    if (document.dir == "rtl") {
      this.documentDir = "rtl";
    }
  }
  
  // Press continue button for phone number
  phoneNumContinue() {
    var isPrivacyEnable = this.config.getConfig('privacy_policy');
    if (this.phoneNumber.match(/^\(?\+?\d?[-\s()0-9]{6,}$/) && this.phoneNumber !== this.countryCode) {
      let isPrivacyAgreed = localStorage.getItem('privacy_agreed');
      MobileTicketAPI.setPhoneNumber(this.phoneNumber);
      if ( isPrivacyAgreed === 'true' || isPrivacyEnable !== 'enable') {
        this.createVisit()
      } else {
        this.phoneSectionState = phoneSectionStates.PRIVACY_POLICY;
      }
    
    } else {
      this.phoneNumberError = true;
    }

  }
  // Change phone number input feild
  onPhoneNumberChanged() {
    this.phoneNumberError = false;
  }
  // understood button pressed
  understoodPrivacyConsent() {
    localStorage.setItem('privacy_agreed', 'true');
    this.createVisit();
  }
  // creating  visit
  createVisit() {
    MobileTicketAPI.createVisit(
      (visitInfo) => {
        ga('send', {
          hitType: 'event',
          eventCategory: 'visit',
          eventAction: 'create',
          eventLabel: 'vist-create'
        });

        this.router.navigate(['ticket']);
        // this.isTakeTicketClickedOnce = false;
      },
      (xhr, status, errorMessage) => {
        let util = new Util();
        // this.isTakeTicketClickedOnce = false;
        if (util.getStatusErrorCode(xhr && xhr.getAllResponseHeaders()) === "8042") {
          this.translate.get('error_codes.error_8042').subscribe((res: string) => {
            this.alertDialogService.activate(res);
          });
        } else if (util.getStatusErrorCode(xhr && xhr.getAllResponseHeaders()) === "11000") {
          this.translate.get('ticketInfo.visitAppRemoved').subscribe((res: string) => {
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
              });
          });
        }
      }
    );
  }
  phoneNumberFeildFocused() {
    if (this.phoneNumber === '') {
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
    this.showNetorkErrorEvent.emit(this._showNetWorkError);
  }
  privacyLinkButtonPressed() {
    var isLink = this.config.getConfig('privacy_policy_link');
    if (isLink !== '') {
      window.open(isLink, "_blank");
    } else {
      this.router.navigate(['privacy_policy']);
    }
  }

}
