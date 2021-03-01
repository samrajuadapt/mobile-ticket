import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Config } from '../config/config';

declare var MobileTicketAPI: any;

@Injectable()
export class BranchScheduleService {
    private branchSchedule;
    constructor(private config: Config, private translate: TranslateService) {
        try {
          this.branchSchedule = this.config.getConfig('branch_schedule');
        } catch (error) {
          console.log(error.message + ' error reading branch_schedule');
        }
    }

    public checkAvailability(branchId, serviceId, success) {
        const _this = this;
        const successCallBack = function(res){
            const modifyRes = JSON.parse(res.value);
            _this.setServiceAvailablity(modifyRes.services);
            const branchStatus = _this.getBranchStatus(modifyRes);
            let serviceStatus = serviceId ? _this.getServiceStatus(serviceId, modifyRes.services) : true;
            serviceStatus = serviceStatus ? _this.getAllServiceAvailableStatus(modifyRes.services) : serviceStatus;
            const isAvailable = branchStatus && serviceStatus;
            success(isAvailable);
        }
        const errorCallBack = function(error){
            success(true);
        }
        MobileTicketAPI.getBranchSchedule(branchId, successCallBack, errorCallBack);
    }

    getBranchStatus(data) {
        return data.status === 1 ? true : false;
    }

    setServiceAvailablity(data) {
        MobileTicketAPI.setServiceAvailability(data);
    }

    getServiceStatus(serviceId, data) {
        const serviceData = data ? data.find(service => service.id === +serviceId) : undefined;
        return (data === undefined || serviceData && serviceData.status === 1) ? true : false;
    }

    getAllServiceAvailableStatus(data) {
        const serviceData = data.find(service => service.status === 1);
        return serviceData === undefined ? false : true;
    }
}
