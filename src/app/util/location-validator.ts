import { Config } from '../config/config';
import { Injectable } from '@angular/core';
import { GpsPositionCalculator } from '../util/gps-distance-calculator';
import { LocationService } from '../util/location';
import { PositionEntity } from '../entities/position.entity';
import { BranchEntity } from '../entities/branch.entity';

declare var MobileTicketAPI: any;

@Injectable()
export class LocationValidator {

    public currentPosition: PositionEntity;

    constructor(private config: Config, private currentLocation: LocationService) {

    }

    public isInLocation(branchId, success) {
        let radius = +(this.config.getConfig('branch_radius'));
        if (location.protocol === 'https:' && radius > 0) {
            const _thisObj = this;
            this.getBranchEntity(branchId, function(branchEntity){
                if (branchEntity === null) {
                    success(true);
                } else {
                    _thisObj.currentLocation.watchCurrentPosition((currentPosition) => {
                        _thisObj.currentPosition = new PositionEntity(currentPosition.coords.latitude, currentPosition.coords.longitude);
                        let calculator = new GpsPositionCalculator(_thisObj.config);
                        let distance = calculator.getRawDiatance(_thisObj.currentPosition.latitude,
                        _thisObj.currentPosition.longitude, branchEntity.position.latitude, branchEntity.position.longitude);
                        _thisObj.currentLocation.removeWatcher();
                        if ((distance * 1000) > radius) {
                            success(false, true);
                        } else {
                            success(true);
                        }
                    }, (error) => {
                        success(false, false);
                        _thisObj.currentLocation.removeWatcher();
                    });
                }
            });
      } else {
          success(true);
      }
    }

    private getBranchEntity(branchId, callBack) {
        const successCallBack = function(res){
            let branchEntity = new BranchEntity();
            branchEntity.id = res.id;
            branchEntity.name = res.name;
            branchEntity.position = new PositionEntity(res.latitude, res.longitude);
            MobileTicketAPI.setBranchSelection(branchEntity);
            callBack(branchEntity);
        }
        const errorCallBack = function(error){
            callBack(null);
        }

        MobileTicketAPI.getBranchInfoById(branchId, successCallBack, errorCallBack);
    }
}
