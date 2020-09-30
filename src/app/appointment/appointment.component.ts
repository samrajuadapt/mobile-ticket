import { Component, Input, OnInit } from '@angular/core';
import { BranchEntity } from '../entities/branch.entity';
import { ServiceEntity } from '../entities/service.entity';
import { TicketEntity } from '../entities/ticket.entity';
import { AppointmentEntity } from '../entities/appointment.entity';
import { Config } from '../config/config';
import { Router } from '@angular/router';

import { Util } from './../util/util'
import { TranslateService } from 'ng2-translate';
import { AlertDialogService } from '../shared/alert-dialog/alert-dialog.service';

declare var MobileTicketAPI: any;
declare var ga: Function;

@Component({
  selector: 'appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css', '../shared/css/common-styles.css']
})
export class AppointmentComponent implements OnInit {
  public iHight = 0;
  public branchEntity: BranchEntity;
  public serviceEntity: ServiceEntity;
  public ticketEntity: TicketEntity;
  public app: AppointmentEntity;
  private isIOS;
  private language;
  private ticket;
  public isLate = false;
  public isEarly = false;
  public isInvalidStatus = false;
  public isInvalidDate = false;
  public isInvalid = false;
  public isNotFound = false;
  private arriveAppRetried = false;

  constructor(private config: Config, public router: Router, private translate: TranslateService,
    private alertDialogService: AlertDialogService) {
  }

  ngOnInit() {
    let userAgent;
    let util = new Util();
    if (typeof navigator !== 'undefined' && navigator) {
      userAgent = navigator.userAgent;
      this.language = navigator.language;
    }
    this.isIOS = util.isBrowseriOS(userAgent)
    this.app = MobileTicketAPI.getAppointment();
    this.isInvalid = this.isAppointmentInvalid();
    this.getBranch();
  }

  onArriveAppointment() {
    let visitInfo = MobileTicketAPI.getCurrentVisit();
    if (visitInfo && visitInfo != null) {
      let alertMsg = '';
      this.translate.get('visit.onGoingVisit').subscribe((res: string) => {
        alertMsg = res;
        this.alertDialogService.activate(alertMsg).then(res => {
          this.router.navigate(['ticket']);
        }, () => {

        });
      });
    } else {
      MobileTicketAPI.findEntrypointId(this.app.branchId, (response) => {
        if (response.length > 0) {
          let entryPointId = response[0].id;
          MobileTicketAPI.arriveAppointment(this.app.branchId, entryPointId, this.app.qpId, this.app.notes, (response) => {
            this.ticket = response;
            this.router.navigate(['ticket']);
          },
            (xhr, status, errorMessage) => {
              console.log(errorMessage);
              if (!this.arriveAppRetried) {
                this.fetchAppointment().then(() => {
                  this.app = MobileTicketAPI.getAppointment();
                  this.isInvalid = this.isAppointmentInvalid();
                  this.arriveAppRetried = true;
                });
              }
            });
        }
      },
        (xhr, status, errorMessage) => {
          // do something
        });
    }
  }

  private async fetchAppointment() {
    return await new Promise((resolve) => {
      let aEntity = new AppointmentEntity();
      MobileTicketAPI.findAppointment(this.app.publicId, (response) => {
        aEntity.publicId = this.app.publicId;
        aEntity.branchName = response.branch.name;
        aEntity.qpId = response.qpId;
        MobileTicketAPI.findCentralAppointment(response.qpId,
          (response2) => {
            aEntity.serviceId = response2.services[0].id;
            aEntity.serviceName = response2.services[0].name;
            aEntity.branchId = response2.branchId;
            aEntity.status = response2.status;
            aEntity.startTime = response2.startTime;
            aEntity.endTime = response2.endTime;
            aEntity.notes = response2.properties.notes;
            MobileTicketAPI.setAppointment(aEntity);
            resolve();
          },
          (xhr, status, errorMessage) => {
            aEntity.status = 'NOTFOUND';
            MobileTicketAPI.setAppointment(aEntity);
            resolve();
          });
      },
        (xhr, status, errorMessage) => {
          aEntity.status = 'NOTFOUND';
          MobileTicketAPI.setAppointment(aEntity);
          resolve();
        });
    });
  }
  private getBranch() {
    if (this.app.branchId !== undefined) {
      MobileTicketAPI.getBranchInfoById(this.app.branchId, (res) => {
        let branchEntity: BranchEntity;
        branchEntity = new BranchEntity();
        branchEntity.id = res.id;
        branchEntity.name = res.name;
        MobileTicketAPI.setBranchSelection(branchEntity);
      });
    }
  }

  // MOVE ALL MobileTicketAPI calls to service class otherwise using things this way
  // makes unit test writing impossible

  private isAppointmentInvalid(): boolean {
    let now = new Date();
    let appStart = new Date(this.app.startTime.replace('T', ' ').replace(/-/g, '/'));

    this.app.startTimeFormatted = this.formatTime(appStart);
    this.app.date = this.formatDate(appStart);

    if (this.app.status === 'NOTFOUND')
      this.isNotFound = true;

    if (this.app.status !== 'CREATED' && this.app.status !== 'NOTFOUND')
      this.isInvalidStatus = true;

    let minDiff = (now.getTime() - appStart.getTime()) / 1000 / 60;
    if (minDiff >= 0 && Math.abs(minDiff) > this.config.getConfig('appointment_late'))
      this.isLate = true;
    else
      this.isLate = false;

    if (minDiff < 0 && Math.abs(minDiff) > this.config.getConfig('appointment_early'))
      this.isEarly = true;
    else
      this.isEarly = false;

    let todayDate = this.formatDate(now);
    if (this.app.date !== todayDate)
      this.isInvalidDate = true;
    return this.isLate || this.isEarly || this.isInvalidStatus || this.isInvalidDate;
  }

  private formatTime(time) {
    let formatted = '';
    let format = this.config.getConfig('timeFormat');

    let min = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
    let hours = '';

    if (format === 'HH:mm') {
      hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
      formatted = hours + ':' + min;
    }

    else if (format === 'hh:mm a') {
      if (time.getHours() > 12) {
        hours = (time.getHours() - 12) < 10 ? '0' + (time.getHours() - 12) : (time.getHours() - 12).toString();
        formatted = hours + ':' + min;
      }
      else {
        hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
        formatted = hours + ':' + min;
      }
      if (time.getHours() > 11) {
        formatted += ' pm';
      } else {
        formatted += ' am';
      }
    }
    else if (format === 'hh:mm') {
      if (time.getHours() > 12) {
        hours = (time.getHours() - 12) < 10 ? '0' + (time.getHours() - 12) : (time.getHours() - 12).toString();
      }
      else {
        hours = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
      }
      formatted = hours + ':' + min;
    }
    else if (format === 'h:mm') {
      if (time.getHours() > 12) {
        hours = '' + (time.getHours() - 12);
      }
      else {
        hours = time.getHours();
      }
      formatted = hours + ':' + min;
    }
    else if (format === 'h:mm a') {
      if (time.getHours() > 12) {
        hours = '' + (time.getHours() - 12);
        formatted = hours + ':' + min;
      }
      else {
        hours = time.getHours();
        formatted = hours + ':' + min;
      }
      if (time.getHours() > 11) {
        formatted += ' pm';
      } else {
        formatted += ' am';
      }
    }
    return formatted;
  }

  private formatDate(date) {
    let formatted = '';
    let format = this.config.getConfig('dateFormat');

    formatted = format;
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let realMonth = date.getMonth() + 1;
    let month = realMonth < 10 ? '0' + realMonth : realMonth;
    formatted = formatted.replace('DD', day);
    formatted = formatted.replace('MM', month);
    formatted = formatted.replace('YYYY', date.getFullYear());
    formatted = formatted.replace('YY', date.getYear());

    return formatted;
  }

}
