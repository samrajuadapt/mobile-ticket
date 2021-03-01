import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {
  public privacyDescription: string;

  constructor(public router: Router, private translate: TranslateService, ) { 
    this.translate.get('pricacy_policy.description').subscribe((description: string) => {
      this.privacyDescription = description;
    });
  }

  ngOnInit() {
    setTimeout(() => {
      const privecyContent = document.getElementById('privacy-content');
      if (privecyContent) {
        privecyContent.innerHTML = this.privacyDescription;
      }

    }, 100);
  }

  onBackButtonPressed() {
    this.router.navigate(['customer_data']);
  }

}
