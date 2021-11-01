import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ServiceEntity } from "../../entities/service.entity";
import { ServiceGroupEntity } from "../../entities/service-group.entity";

declare var MobileTicketAPI: any;
declare var ga: Function;

@Component({
	selector: 'app-service-group-item',
	templateUrl: './group-item.html',
	styleUrls: ['./group-item.css']
})



export class ServiceGroupItemComponent {
	@Input() name: string
	@Input() services: Array<ServiceEntity>
	@Input() isSelected: boolean = false;
	@Output() onServiceSelection:EventEmitter<ServiceEntity> = new EventEmitter<ServiceEntity>(); 
	@Output() onGroupSelection:EventEmitter<any> = new EventEmitter<any>();
	public isRtl: boolean;

	ngOnInit() {
		this.setRtlStyles();    
	  }

	public selectGroup(){
		this.onGroupSelection.emit();
	}

	public selectService(service: ServiceEntity){
    	if (service.selected) {
      		this.onServiceSelection.emit(service);
    	} else {
      		this.onServiceSelection.emit(undefined);
    	}
	}

	setRtlStyles() {
		if (document.dir === 'rtl') {
		  this.isRtl = true;
		} else {
		  this.isRtl = false;
		}
	  }

}
