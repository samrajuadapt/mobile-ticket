import { Component, AfterViewInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceEntity } from '../../entities/service.entity';
import { RetryService } from '../../shared/retry.service';
import { Util } from './../../util/util'
import { Config} from '../../config/config';
import { BranchOpenHoursValidator} from '../../util/branch-open-hours-validator'

declare var MobileTicketAPI: any;

@Component({
  selector: 'delay-services',
  templateUrl: './delay-tmpl.html',
  styleUrls: ['./delay.css']
})
export class DelaysComponent implements AfterViewInit {
  public delays: Array<any> = [];
  public showListShadow: boolean;
  @Output() onServiceListHeightUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onDelaySelection: EventEmitter<any> = new EventEmitter<any>();
  @Output() onShowHideServiceFetchError = new EventEmitter<boolean>();
  @Output() onDelayListEmpty: EventEmitter<any> = new EventEmitter<any>();

  constructor(private retryService: RetryService, private router: Router,
              private config: Config, private openHourValidator: BranchOpenHoursValidator) {
    this.onShowHideServiceFetchError.emit(false);
    this.setDelayList();
  }

  private onListLoaded() {
    
    //this.setSelectedService(MobileTicketAPI.getSelectedService());
  }

  setDelayList() {
    let delayList = this.config.getConfig('delay_visit').time_slot.value;
    delayList.forEach(element => {
      let obj = {"time" : element, "selected" : false }
      if (this.openHourValidator.openHourValidForDelay(element)) {
        this.delays.push(obj);
      }
    });
    if (this.delays.length === 0) {
      var _thisObj = this;
      setTimeout(() => {
        _thisObj.onDelayListEmpty.emit(true);
      }, 1000);
      
    }
    this.initListShadow();
  }

  // private onServicesReceived(serviceList, serviceService): void {
  //   this.onShowHideServiceFetchError.emit(false);
  //   if (serviceList.length === 0) {
  //     this.router.navigate(['open_hours']);
  //   } else if (serviceList.length === 1) {
  //     this.onServiceSelection.emit(serviceList[0].id);
  //     MobileTicketAPI.setServiceSelection(serviceList[0]);
  //   }
  //   new Util().sortArrayCaseInsensitive(serviceList, "name", "asc");
  //   this.services = serviceList;
    
  // }

  ngAfterViewInit() {
    if(!this.openHourValidator.openHoursValid()) {
            this.router.navigate(['open_hours']);
    }
    window.addEventListener('orientationchange', this.setListShadow, true);
    window.addEventListener('resize', this.setListShadow, true);
    window.addEventListener('scroll', this.setListShadow, true);
  }

  // setSelectedService(selectedService: ServiceEntity) {
  //   if (selectedService) {
  //     this.onServiceSelection.emit(selectedService.id);
  //     for (let i = 0; i < this.services.length; ++i) {
  //       if (selectedService.id === this.services[i].id) {
  //         this.services[i].selected = true;
  //       }
  //     }
  //   }
  // }

  resetSelections(selectedDelay: any) {
    if (selectedDelay) {
      this.onDelaySelection.emit(selectedDelay);
      for (let i = 0; i < this.delays.length; ++i) {
        if (selectedDelay.time !== this.delays[i].time) {
          this.delays[i].selected = false;
        }
      }
    }
    else {
      this.onDelaySelection.emit(undefined);
    }
  }

  setListShadow = () => {
    this.processListShadow();
  }

  initListShadow = () => {
    setTimeout(() => {
      this.processListShadow();
    }, 200);
  }

  processListShadow() {
    if ((document.getElementsByClassName('table-child-list')[0] && document.getElementsByClassName('table-child-list')[0].clientHeight +
      document.getElementsByClassName('table-child-list')[0].scrollTop
      >= document.getElementsByClassName('table-child-list')[0].scrollHeight - 5)) {
      this.showListShadow = false;
    }
    else {
      this.showListShadow = true;
    }
    this.onServiceListHeightUpdate.emit(this.showListShadow);
  }

}
