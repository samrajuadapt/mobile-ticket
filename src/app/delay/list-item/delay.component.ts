import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ServiceEntity } from '../../entities/service.entity';
import { TicketEntity } from '../../entities/ticket.entity';

declare var MobileTicketAPI: any;

@Component({
  selector: 'delay-service',
  templateUrl: './delay-tmpl.html',
  styleUrls: ['./delay.css', './delay-rtl.css']

})
export class DelayComponent implements OnInit {
  @Input() name: string
  @Input() entity: ServiceEntity
  @Input() selected: boolean
  @Input() customersWaiting: string
  @Output() onSelection = new EventEmitter();
  public isRtl: boolean;
  public time: string;

  constructor() {
   }

  ngOnInit() {
    this.setRtlStyles();
    this.time  = this.name + ' min';
  }

  onSelectDelay(delay) {
    delay.selected = !delay.selected;
    if (delay.selected) {
      this.onSelection.emit(delay);
    } else {
      this.onSelection.emit(undefined);
    }
  }

  setRtlStyles(){
    if(document.dir == "rtl"){
      this.isRtl = true;
    }else{
      this.isRtl = false;
    }
  }

  getVisibilityOfTick(){
    if(this.selected){
      return "visible";
    }else{
      return "hidden";
    }
  }
}
