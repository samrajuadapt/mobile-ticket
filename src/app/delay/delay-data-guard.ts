import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ServiceEntity } from '../entities/service.entity';

declare var MobileTicketAPI: any;
@Injectable()
export class DelayDataGuard implements CanActivate {

  constructor(private router: Router) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let visitInfo = MobileTicketAPI.getCurrentVisit();
    let selectedService = MobileTicketAPI.getSelectedService();
    let delay = MobileTicketAPI.getCurrentDelayInfo();
    if (visitInfo ===  null && selectedService ===  null) {
        this.router.navigate(['services']);
        return false;
    } else if (visitInfo && delay === null) {
      this.router.navigate(['ticket']);
      return false;
    } else {
        return true;
    }
  }
}
