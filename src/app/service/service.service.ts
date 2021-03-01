import { Injectable } from '@angular/core';
import { ServiceEntity } from '../entities/service.entity';
// import 'rxjs/add/operator/map';
import { TranslateService } from '@ngx-translate/core';
import { Config } from '../config/config';
import { BranchScheduleService } from '../shared/branch-schedule.service';

declare var MobileTicketAPI: any;

@Injectable()
export class ServiceService {

  private onCountDownCompleteCallback;
  private timerStart = 10 * 60 * 1000; // minutes
  private serviceRefreshLintervel = 15; // seconds
  private timerGap = 1000;
  private isSingleBranch;
  private countDownreTimersource;
  private serviceFecthTimerResource

  constructor(private config: Config, private translate: TranslateService, private branchScheduleService: BranchScheduleService) {
    try {
      this.timerStart = this.config.getConfig('service_screen_timeout') * 60 * 1000;
    } catch (error) {
      console.log(error.message + ' error reading service_screen_timeout');
    }
  }

  public fetchServices(callback) {
    MobileTicketAPI.getServices(
      (serviceList: any) => {
        let serviceEntities = this.convertToServiceEntities(serviceList);
        callback(serviceEntities, false);
      },
      () => {
        callback(null, true);
      });
  }

  private intiCountDown() {
    let currenVal = this.timerStart;
    this.stopBranchRedirectionCountDown();
    this.countDownreTimersource = setInterval(() => {
      if (currenVal === 0) {
        clearInterval(this.countDownreTimersource);
        clearInterval(this.serviceFecthTimerResource);
        this.onCountDownCompleteCallback();
      }
      currenVal = currenVal - this.timerGap;
    }, this.timerGap);
  }

  public stopServiceFetchTimer() {
    clearInterval(this.serviceFecthTimerResource);
  }

  public stopBranchRedirectionCountDown() {
    clearInterval(this.countDownreTimersource);
  }

  public convertToServiceEntities(serviceList): Array<ServiceEntity> {
    let entities: Array<ServiceEntity> = [];
    let serviceEntity: ServiceEntity;
    const serviceAvailablity = MobileTicketAPI.getServiceAvailablity();
    for (let i = 0; i < serviceList.length; i++) {
      const serviceStatus = this.branchScheduleService.getServiceStatus(serviceList[i].serviceId, serviceAvailablity);
      if (serviceStatus) {
        serviceEntity = new ServiceEntity();
        serviceEntity.id = serviceList[i].serviceId;
        serviceEntity.name = serviceList[i].serviceName;
        serviceEntity.waitingTime = serviceList[i].waitingTimeInDefaultQueue;
        serviceEntity.customersWaiting = this.getShowCustomerAvailability() ?
        serviceList[i].customersWaitingInDefaultQueue.toString() : undefined;
        serviceEntity.selected = false;
        entities.push(serviceEntity);
      }
    }
    if (entities.length === 1) {
      entities[0].selected = true;
    }
    return entities;
  }

  public registerCountDownCompleteCallback(callback, singleBranch) {
    this.onCountDownCompleteCallback = callback;
    this.isSingleBranch = singleBranch;
  }

  public getServices(callback): void {
    this.stopServiceFetchTimer();
    this.fetchServices((serviceEntities, error) => {
      this.intiCountDown();
      callback(serviceEntities, error)
    });

    if (this.getShowCustomerAvailability()) {
      try {
        this.serviceRefreshLintervel = this.config.getConfig('service_fetch_interval');
      } catch (error) {
        console.log(error.message + ' error reading service_fetch_interval');
      }

      this.serviceFecthTimerResource = setInterval(() => {
        this.fetchServices(callback);
      }, this.serviceRefreshLintervel * 1000);
    }
  }

  getShowCustomerAvailability() {
    let showStatus = this.config.getConfig('show_number_of_waiting_customers');
    if (showStatus === 'enable') {
      return true;
    } else {
      return false;
    }
  }


  public convertToServiceEntity(serviceRes) {
    let serviceEntity: ServiceEntity;
    serviceEntity = new ServiceEntity();
    serviceEntity.id = serviceRes.id;
    serviceEntity.name = serviceRes.name;
    return serviceEntity;

  }

  public getServiceById(id, onServiceRecieved): void {
    MobileTicketAPI.getServiceInfoById(id, (res) => {
      onServiceRecieved(this.convertToServiceEntity(res), false);
    }, (error) => {
      onServiceRecieved(null, true);
    });
  }
}
