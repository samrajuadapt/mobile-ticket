import { Component, OnInit } from '@angular/core';
import { TranslateService } from 'ng2-translate';

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
