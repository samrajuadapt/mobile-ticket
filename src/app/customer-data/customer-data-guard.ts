import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ServiceEntity } from '../entities/service.entity';
import { BranchEntity } from '../entities/branch.entity';

declare var MobileTicketAPI: any;
@Injectable()
export class CustomerDataGuard implements CanActivate {
  public selectedBranch: BranchEntity;
  public selectedService: ServiceEntity;

  getSelectedBranch() {
    this.selectedBranch = MobileTicketAPI.getSelectedBranch();

  }
  getSelectedServices() {
    this.selectedService = MobileTicketAPI.getSelectedService();
  }
  constructor(private router: Router) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.getSelectedBranch();
    this.getSelectedServices();
    if (this.selectedService && this.selectedBranch) {
      return true;
    } else {
      this.router.navigate(['ticket']);
      return false;
    }


  }
}
