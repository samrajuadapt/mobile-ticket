import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from '../../../app/config/config';

declare var ga: Function;
@Component({
  selector: 'app-cookie-consent-dialog',
  templateUrl: './cookie-consent-dialog.component.html',
  styleUrls: ['./cookie-consent-dialog.component.css']
})
export class CookieConsentDialogComponent implements OnInit {
  public CookieConsentShow: boolean = true;

  constructor(
    public router: Router,
    private config: Config,
  ) { }

  ngOnInit() {
    const isCookieConsentAccepted = localStorage.getItem("cookie_consent");
    const is_cookie_consent_enabled = this.config.getConfig('cookie_consent');
    if (isCookieConsentAccepted == 'true' || is_cookie_consent_enabled === 'disable') {
      this.CookieConsentShow = false;
    } else {
      this.CookieConsentShow = true;
    }
    
  }

  gotoCookieConsent() {
    this.router.navigate(['cookie_consent']);
  }

  acceptCookieConsent() {
    localStorage.setItem('cookie_consent','true');
    let track_id = this.config.getConfig('ga_track_id');
    this.CookieConsentShow = false;
    if (track_id && track_id !== '') {
      ga('create', track_id, 'auto');
      ga('send', 'pageview');
    }
  }

  declineCookieConsent() {
    localStorage.setItem('cookie_consent','false');
    this.CookieConsentShow = false;
  }

}
