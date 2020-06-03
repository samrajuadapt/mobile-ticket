import { Component, OnInit } from '@angular/core';
import { BranchEntity } from '../entities/branch.entity';
import { ServiceEntity } from '../entities/service.entity';
import { TranslateService } from 'ng2-translate';
import { RetryService } from '../shared/retry.service';
import { AlertDialogService } from '../shared/alert-dialog/alert-dialog.service';
import { Config } from '../config/config';
import { Router } from '@angular/router';
import { Util } from '../util/util';

declare var MobileTicketAPI: any;
declare var ga: Function;

@Component({
  selector: 'app-customer-data',
  templateUrl: './customer-data.component.html',
  styleUrls: ['./customer-data.component.css']
})
export class CustomerDataComponent implements OnInit {
  public selectedBranch: BranchEntity;
  public selectedService: ServiceEntity;
  private _showNetWorkError = false;
  private isTakeTicketClickedOnce: boolean;

  constructor(
    private translate: TranslateService,
    public router: Router,
    private retryService: RetryService,
    private alertDialogService: AlertDialogService,
    private config: Config
  ) { }

  ngOnInit() {
    this.getSelectedBranch();
    this.getSelectedServices();
  }
  getSelectedBranch() {
    this.selectedBranch = MobileTicketAPI.getSelectedBranch();

  }
  getSelectedServices() {
    this.selectedService = MobileTicketAPI.getSelectedService();
  }
  get showNetWorkError(): boolean {
    return this._showNetWorkError;
  }
  showHideNetworkError(event) {
    this._showNetWorkError = event;
  }

  // creating  visit
  createVisit() {
    if (!this.isTakeTicketClickedOnce) {
      this.isTakeTicketClickedOnce = true;
      if (MobileTicketAPI.getCurrentVisit()) {
        this.router.navigate(['ticket']);
      } else {
        MobileTicketAPI.createVisit(
          (visitInfo) => {
            ga('send', {
              hitType: 'event',
              eventCategory: 'visit',
              eventAction: 'create',
              eventLabel: 'vist-create'
            });

            this.router.navigate(['ticket']);
            this.isTakeTicketClickedOnce = false;
          },
          (xhr, status, errorMessage) => {
            let util = new Util();
            this.isTakeTicketClickedOnce = false;
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
    }
  }

}
