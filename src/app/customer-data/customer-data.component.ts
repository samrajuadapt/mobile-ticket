import { Component, OnInit } from '@angular/core';
import { BranchEntity } from '../entities/branch.entity';
import { ServiceEntity } from '../entities/service.entity';
declare var MobileTicketAPI: any;

@Component({
  selector: 'app-customer-data',
  templateUrl: './customer-data.component.html',
  styleUrls: ['./customer-data.component.css']
})
export class CustomerDataComponent implements OnInit {
  public selectedBranch: BranchEntity;
  public selectedService: ServiceEntity;
  private _showNetWorkError = false;

  constructor() { }

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

}
