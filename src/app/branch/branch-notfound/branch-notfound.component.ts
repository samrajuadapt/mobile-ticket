import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-branch-notfound',
  templateUrl: './branch-notfound.component.html',
  styleUrls: ['./branch-notfound.component.css', '../../shared/css/common-styles.css']
})
export class BranchNotfoundComponent implements OnInit {

  public branchId: number;
  public serviceId: number;
  public isLocationPermission: boolean;

  constructor(public router: Router, private translate: TranslateService, private activatedRoute: ActivatedRoute) { 

  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.branchId = params['branchId'];
      this.serviceId = params['serviceId'];
      this.isLocationPermission = params['locationPermission'] === 'true' ? true : false;
      console.log(this.isLocationPermission)
    });
  }

  public reloadData() {
    if (this.serviceId && this.branchId) {
      this.router.navigate(['branches', this.branchId, 'services', this.serviceId]);
    } else if (this.branchId) {
      this.router.navigate(['branches', this.branchId]);
    } else {
      this.router.navigate(['branches']);
    }
  }


}
