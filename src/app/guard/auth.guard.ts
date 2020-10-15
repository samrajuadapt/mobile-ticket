import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from 'ng2-translate';
import { Util } from '../util/util';
import { ServiceEntity } from '../entities/service.entity';
import { BranchService } from '../branch/branch.service';
import { BranchEntity } from '../entities/branch.entity';
import { AppointmentEntity } from '../entities/appointment.entity';
import { AlertDialogService } from '../shared/alert-dialog/alert-dialog.service';
import { Config } from '../config/config';
import { BranchOpenHoursValidator } from '../util/branch-open-hours-validator'
import { ServiceService } from '../service/service.service';
import { BranchScheduleService } from '../shared/branch-schedule.service';
declare var System: any;
declare var MobileTicketAPI: any;
declare var ga: Function;
declare var require: any;

@Injectable()
export class AuthGuard implements CanActivate {

    private prevUrl = '/';
    private branchService: BranchService;
    private serviceService: ServiceService
    private isNoSuchBranch = false;
    private isNoSuchVisit = false;
    private isNoSuchVisitDirectToBranch = false;
    private branchId = 0;
    private directedBranch: BranchEntity = null;
    private aEntity: AppointmentEntity = null;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private branchSrvc: BranchService,
        private serviceSrvc: ServiceService, private alertDialogService: AlertDialogService,
        private translate: TranslateService, private config: Config,
        private branchScheduleService: BranchScheduleService, private openHourValidator: BranchOpenHoursValidator) {
        this.branchService = branchSrvc;
        this.serviceService = serviceSrvc;
    }

    createTicket(bEntity: BranchEntity, sEntity: ServiceEntity, resolve) {
        MobileTicketAPI.setServiceSelection(sEntity);
        MobileTicketAPI.setBranchSelection(bEntity);

        MobileTicketAPI.createVisit((vstInfo) => {
            ga('send', {
                hitType: 'event',
                eventCategory: 'visit',
                eventAction: 'create',
                eventLabel: 'vist-create'
            });
            this.router.navigate(['ticket']);
            resolve(false);

        },
            (xhr, status, errorMessage) => {
                this.isNoSuchVisitDirectToBranch = true;
                this.directedBranch = bEntity;
                this.isNoSuchVisit = true;
                MobileTicketAPI.resetAllVars();
                this.router.navigate(['no_visit']);
                resolve(false);
            }
        );
    }

    checkOpenHours(resolve) {
        if (this.config.getConfig('branch_schedule') !== 'enable') {
            return false;
        } else if (!this.openHourValidator.openHoursValid()) {
            this.router.navigate(['open_hours']);
            resolve(false);
            return true;
        } else {
            return false;
        }
    }

    checkCreateTicketOption(resolve) {
        let createStatus = this.config.getConfig('create_new_ticket');
        if (createStatus === 'enable') {
            return false;
        } else {
            this.router.navigate(['no_support']);
            resolve(false);
            return true;
        }
    }

    checkBrowserSupport() {
        let util = new Util()
        let agent;
        if (typeof navigator !== 'undefined' && navigator) {
            agent = navigator.userAgent;
        }
        try {
            let browser = util.getDetectBrowser(agent)
            if (browser.name === 'chrome' || browser.name === 'safari' || browser.name === 'ios'
                || browser.name === 'opera' || browser.name === 'crios' || browser.name === 'firefox'
                || browser.name === 'fxios' || browser.name === 'edge' || browser.name === 'edgios') {
                    return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.checkBrowserSupport()) {
                resolve(false);
            }
            let url = state.url;

            if (this.isNoSuchBranch && url.startsWith('/no_branch')) {
                this.isNoSuchBranch = false;
                resolve(true);
            } else if (url.startsWith('/open_hours')) {
                resolve(true);
            } else if (this.isNoSuchVisit && url.startsWith('/no_visit')) {
                this.isNoSuchVisit = false;
                resolve(true);
            } else if (this.config.getConfig('branch_schedule') === 'enable') {
                let branchId = route.queryParams['branch'];
                let serviceId;
                if (url.startsWith('/branches/')) {
                    branchId = route.url[1].path;
                } else if (route.url.length === 4 && route.url[1].path
                    && route.url[2].path === ('services') && route.url[3].path) {
                        branchId = route.url[1].path;
                        serviceId = route.url[3].path;
                } else if (url.startsWith('/services')) {
                    const selectedBranch = MobileTicketAPI.getSelectedBranch();
                    branchId = selectedBranch ? selectedBranch.id : undefined;
                }

                if (branchId) {
                    const _thisObj = this;
                    this.branchScheduleService.checkAvailability(branchId, serviceId, function(status){
                        if (status) {
                            _thisObj.processRoute(state, route, resolve);
                        } else {
                            _thisObj.router.navigate(['open_hours']);
                            resolve(false);
                        }
                    });
                } else {
                    this.processRoute(state, route, resolve);
                }
            } else {
                this.processRoute(state, route, resolve);
            }
        });
    }

    processRoute(state, route, resolve) {
        let visitInfo = MobileTicketAPI.getCurrentVisit();
        let url = state.url;
        let branchId = route.queryParams['branch'];
        let visitId = route.queryParams['visit'];
        let checksum = route.queryParams['checksum'];
        let appointmentId = route.queryParams['appId'];
        if (url.startsWith('/branches/') || url.endsWith('/branches') || url.endsWith('/branches;redirect=true')) {
            /**
             * for qr-code format: http://XXXX/branches/{branchId}
             * Redirect user to services page for specific branchId
             */
            if (this.isNoSuchVisitDirectToBranch) {
                if (this.checkOpenHours(resolve)) {
                    return;
                }
                if (this.checkCreateTicketOption(resolve)) {
                    return;
                }
                this.isNoSuchVisitDirectToBranch = false;
                MobileTicketAPI.setBranchSelection(this.directedBranch);
                this.router.navigate(['services']);
                resolve(false);
            } else if (route.url.length === 2 && route.url[1].path) {
                let id = route.url[1].path;
                this.branchService.getBranchById(+id, (branchEntity: BranchEntity, isError: boolean, errorCode: string) => {
                    if (!isError) {
                        if (visitInfo) {
                            let alertMsg = '';
                            this.translate.get('visit.onGoingVisit').subscribe((res: string) => {
                                alertMsg = res;
                                this.alertDialogService.activate(alertMsg).then(res => {
                                    resolve(true);
                                }, () => {

                                });
                            });

                        } else {
                            if (this.checkOpenHours(resolve)) {
                                return;
                            }
                            if (this.checkCreateTicketOption(resolve)) {
                                return;
                            }
                            MobileTicketAPI.setBranchSelection(branchEntity);
                            this.router.navigate(['services']);
                            resolve(false);
                        }

                    } else {
                        if (this.checkOpenHours(resolve)) {
                            return;
                        }
                        let e = 'error';
                        this.isNoSuchBranch = true;
                        this.router.navigate(['no_branch']);
                        resolve(true);
                    }
                });
            }
            /**
             * for qr-code format: http://XXXX/branches/{branchId}/services/{serviceId}
             * Redirect user to ticket screen by creating a visit for the given branchId & serviceId
             */
            else if (route.url.length === 4 && route.url[1].path && route.url[2].path === ('services') && route.url[3].path) {
                let bEntity = new BranchEntity();
                bEntity.id = route.url[1].path;
                let sEntity = new ServiceEntity();
                sEntity.id = +route.url[3].path;

                this.branchService.getBranchById(+bEntity.id, (branchEntity: BranchEntity, isError: boolean, errorCode: string) => {
                    if (!isError) {
                        if (visitInfo) {
                            let alertMsg = '';
                            this.translate.get('visit.onGoingVisit').subscribe((res: string) => {
                                alertMsg = res;
                                this.alertDialogService.activate(alertMsg).then(res => {
                                    resolve(true);
                                }, () => {

                                });
                            });
                        } else {
                            if (this.checkOpenHours(resolve)) {
                                return;
                            }
                            if (this.checkCreateTicketOption(resolve)) {
                                return;
                            }
                            let isCustomerDataEnabled = this.config.getConfig('customer_data');
                            if (isCustomerDataEnabled === 'enable') {
                                MobileTicketAPI.setBranchSelection(branchEntity);



                                this.serviceService.fetchServices((serviceList: Array<ServiceEntity>, error: boolean) => {
                                    if (error) {
                                        this.isNoSuchVisit = true;
                                        this.router.navigate(['no_visit']);
                                        resolve(false);
                                    } else {
                                        let serviceFound = false;
                                        serviceList.forEach((service) => {
                                            if (service.id === sEntity.id) {
                                                serviceFound = true;
                                                sEntity.name = service.name;
                                                return;
                                            }
                                        });
                                        if (!serviceFound) {
                                            this.isNoSuchVisit = true;
                                            this.router.navigate(['no_visit']);
                                            resolve(false);
                                        } else {
                                            MobileTicketAPI.setServiceSelection(sEntity);
                                            this.router.navigate(['customer_data']);
                                            resolve(false);
                                        }
                                    }
                                });
                            } else {
                                // Creating ticket
                                let isDeviceBounded = this.config.getConfig('block_other_devices');
                                if (isDeviceBounded === 'enable') {
                                    System.import('fingerprintjs2').then(Fingerprint2 => {
                                        let that = this;

                                        Fingerprint2.getPromise({
                                            excludes: {
                                                availableScreenResolution: true,
                                                adBlock: true,
                                                enumerateDevices: true
                                            }
                                        }).then(function (components) {
                                            let values = components.map(function (component) { return component.value });
                                            let murmur = Fingerprint2.x64hash128(values.join(''), 31);
                                            MobileTicketAPI.setFingerprint(murmur);
                                            that.createTicket(branchEntity, sEntity, resolve);
                                        });
                                    });
                                } else {
                                    // Creating ticket
                                    let isDeviceBounded = this.config.getConfig('block_other_browsers');
                                    if (isDeviceBounded === 'enable') {
                                        System.import('fingerprintjs2').then(Fingerprint2 => {
                                            let that = this;

                                            Fingerprint2.getPromise({
                                                excludes: {
                                                    availableScreenResolution: true,
                                                    adBlock: true,
                                                    enumerateDevices: true
                                                }
                                            }).then(function (components) {
                                                let values = components.map(function (component) { return component.value });
                                                let murmur = Fingerprint2.x64hash128(values.join(''), 31);
                                                MobileTicketAPI.setFingerprint(murmur);
                                                that.createTicket(branchEntity, sEntity, resolve);
                                            });
                                        });
                                    } else {
                                        this.createTicket(branchEntity, sEntity, resolve);
                                    }
                                }

                            }
                        }

                    } else {
                        if (this.checkOpenHours(resolve)) {
                            return;
                        }
                        let e = 'error';
                        this.isNoSuchBranch = true;
                        this.router.navigate(['no_branch']);
                        resolve(false);
                    }
                });
            } else if (route.url.length >= 3 && route.url[2].path !== ('services')) {
                this.isNoSuchVisit = true;
                this.router.navigate(['no_visit']);
                resolve(false);
            } else if (route.url.length === 3 && route.url[2].path === ('services')) {
                this.isNoSuchVisit = true;
                this.router.navigate(['no_visit']);
                resolve(false);
            } else if (visitInfo && this.router.url === '/ticket') {
                this.router.navigate(['/ticket']);
                resolve(false);
            } else if (visitInfo) {
                this.router.navigate(['/ticket']);
                resolve(false);
            } else {
                if (this.checkCreateTicketOption(resolve)) {
                    return;
                }
                resolve(true);
            }


        } else if (url.startsWith('/services')) {
            if ((visitInfo && visitInfo !== null)) {
                this.router.navigate(['ticket']);
                resolve(false);
            } else if ((this.prevUrl.startsWith('/branches') ||
                this.prevUrl === '/' || this.prevUrl === '/services')) {
                if (!this.openHourValidator.openHoursValid()) {
                    this.router.navigate(['open_hours']);
                    resolve(false);
                } else {
                    if (this.checkCreateTicketOption(resolve)) {
                        return;
                    }
                    resolve(true);
                }
            } else if (this.prevUrl.startsWith('/ticket') &&
                (!visitInfo || visitInfo === null)) {
                if (!this.openHourValidator.openHoursValid()) {
                    this.router.navigate(['open_hours']);
                    resolve(false);
                } else {
                    if (this.checkCreateTicketOption(resolve)) {
                        return;
                    }
                    resolve(true);
                }
            }
        } else if (url.startsWith('/appointment')) {
            if (visitInfo && visitInfo !== null) {
                let alertMsg = '';
                this.translate.get('visit.onGoingVisit').subscribe((res: string) => {
                    alertMsg = res;
                    this.alertDialogService.activate(alertMsg).then(res => {
                        this.router.navigate(['ticket']);
                        resolve(false);
                    }, () => {

                    });
                });

            } else {
                this.aEntity = new AppointmentEntity();
                MobileTicketAPI.findAppointment(appointmentId, (response) => {
                    this.aEntity.publicId = appointmentId;
                    this.aEntity.branchName = response.branch.name;
                    this.aEntity.qpId = response.qpId;
                    MobileTicketAPI.findCentralAppointment(response.qpId,
                        (response2) => {
                            this.aEntity.serviceId = response2.services[0].id;
                            this.aEntity.serviceName = response2.services[0].name;
                            this.aEntity.branchId = response2.branchId;
                            this.aEntity.status = response2.status;
                            this.aEntity.startTime = response2.startTime;
                            this.aEntity.endTime = response2.endTime;
                            this.aEntity.notes = response2.properties.notes;
                            MobileTicketAPI.setAppointment(this.aEntity);
                            resolve(true);
                        },
                        (xhr, status, errorMessage) => {
                            this.aEntity.status = 'NOTFOUND';
                            MobileTicketAPI.setAppointment(this.aEntity);
                            resolve(true);
                        });
                },
                    (xhr, status, errorMessage) => {
                        this.aEntity.status = 'NOTFOUND';
                        MobileTicketAPI.setAppointment(this.aEntity);
                        resolve(true);
                    });
            }

        } else if (url.startsWith('/ticket') && (branchId && visitId && checksum) ) {
            if (visitInfo && visitInfo !== null) {
                let alertMsg = '';
                this.translate.get('visit.onGoingVisit').subscribe((res: string) => {
                    alertMsg = res;
                    this.alertDialogService.activate(alertMsg).then(res => {
                        this.router.navigate(['ticket']);
                        resolve(false);
                    }, () => {

                    });
                });

            } else {
                resolve(true);
            }

        } else if (url.startsWith('/ticket') && ((visitInfo !== null && visitInfo)
         && visitInfo.branchId && visitInfo.visitId && visitInfo.checksum) ) {
            resolve(true);
        } else if (visitInfo) {
            MobileTicketAPI.getVisitStatus(
                (visitObj: any) => {
                    if (visitObj.status === 'CALLED' || visitObj.visitPosition !== null) {
                        this.router.navigate(['ticket']);
                        resolve(true);
                    } else {
                        this.router.navigate(['/branches']);
                        resolve(false);
                    }
                },
                (xhr, status, msg) => {
                    this.router.navigate(['/branches']);
                    resolve(false);
                }
            );
        } else if (url.startsWith('/customer_data')) {
            if ((visitInfo && visitInfo !== null)) {
                this.router.navigate(['ticket']);
                resolve(false);
            } else if (this.prevUrl.startsWith('/services') ||
            this.prevUrl === '/' || this.prevUrl.startsWith('/branches') || this.prevUrl.startsWith('/privacy_policy')
                || this.prevUrl.startsWith('/customer_data')) {
                if (!this.openHourValidator.openHoursValid()) {
                    this.router.navigate(['open_hours']);
                    resolve(false);
                } else {
                    if (this.checkCreateTicketOption(resolve)) {
                        return;
                    }
                    resolve(true);
                }
            } else if (this.prevUrl.startsWith('/ticket') &&
                (!visitInfo || visitInfo === null)) {
                if (!this.openHourValidator.openHoursValid()) {
                    this.router.navigate(['open_hours']);
                    resolve(false);
                } else {
                    if (this.checkCreateTicketOption(resolve)) {
                        return;
                    }
                    resolve(true);
                }
            }
            else if (url.startsWith('/otp_number')) {
                if ((visitInfo && visitInfo !== null)) {
                    this.router.navigate(['ticket']);
                    resolve(false);
                } else if (this.prevUrl.startsWith('/customer_data') || this.prevUrl.startsWith('/services')) {
                    if (!(new BranchOpenHoursValidator(this.config)).openHoursValid()) {
                        this.router.navigate(['open_hours']);
                        resolve(false);
                    } else {
                        if (this.checkCreateTicketOption(resolve)) {
                            return;
                        }
                        resolve(true);
                    }
                } else if (this.prevUrl.startsWith('/otp_pin')) {
                    if (!(new BranchOpenHoursValidator(this.config)).openHoursValid()) {
                        this.router.navigate(['open_hours']);
                        resolve(false);
                    } else {
                        if (this.checkCreateTicketOption(resolve)) {
                            return;
                        }
                        resolve(true);
                    }
                } else {
                    this.router.navigate(['/branches']);
                    resolve(false);
                }
            }
            else if (url.startsWith('/otp_pin')) {
                if ((visitInfo && visitInfo !== null)) {
                    this.router.navigate(['ticket']);
                    resolve(false);
                } else if (this.prevUrl.startsWith('/otp_number')) {
                    if (!(new BranchOpenHoursValidator(this.config)).openHoursValid()) {
                        this.router.navigate(['open_hours']);
                        resolve(false);
                    } else {
                        if (this.checkCreateTicketOption(resolve)) {
                            return;
                        }
                        resolve(true);
                    }
                } else {
                    this.router.navigate(['/branches']);
                    resolve(false);
                }
            }


            else {
                this.router.navigate(['/branches']);
                resolve(false);
            }

            if (!(this.prevUrl.startsWith('/branches') && url.startsWith('/ticket'))) {
                this.prevUrl = url;
            }
        } else {
            this.router.navigate(['/branches']);
            resolve(false);
        }

        if (!(this.prevUrl.startsWith('/branches') && url.startsWith('/ticket'))) {
            this.prevUrl = url;
        }
    }
}
