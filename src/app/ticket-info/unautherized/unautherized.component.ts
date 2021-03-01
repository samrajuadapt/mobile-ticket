import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-unautherized',
  templateUrl: './unautherized.component.html',
  styleUrls: ['./unautherized.component.css']
})
export class UnautherizedComponent implements OnInit {

  constructor( private translate: TranslateService) { 
    this.translate.get('ticketInfo.defaultTitle').subscribe((res: string) => {
      document.title = res;
    });
  }

  ngOnInit() {
  }

}
