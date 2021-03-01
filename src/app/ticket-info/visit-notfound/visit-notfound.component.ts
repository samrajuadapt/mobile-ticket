import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-visit-notfound',
  templateUrl: './visit-notfound.component.html',
  styleUrls: ['./visit-notfound.component.css', '../../shared/css/common-styles.css']
})
export class VisitNotfoundComponent implements OnInit {

  constructor(public router: Router, private translate: TranslateService) { 

  }

  ngOnInit() {
  }

  public reloadData() {
    this.router.navigate(['branches']);
  }


}
