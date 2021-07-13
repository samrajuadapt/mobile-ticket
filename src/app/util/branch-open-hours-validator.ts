import { Config } from '../config/config';
import { Injectable } from '@angular/core';

@Injectable()
export class BranchOpenHoursValidator {

    
    constructor(private config : Config){

    }

   public  openHoursValid(){
    if (this.config.getConfig('branch_schedule') === 'enable') {
        return true;
    }
       var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday','friday', 'saturday'];
       let entries = this.config.getConfig("branch_open_hours");
       if(entries == null){
           return false;
       }else{
           let day : number;
           var now = new Date();
           day = now.getDay();
           var hours = now.getHours();
           var minutes = now.getMinutes();
           var openHours = entries.find(function(item){
               return item.description === days[day];
           })
           var from = openHours.from.split(":");
           var to = openHours.to.split(":");

           var openFrom = new Date();
           openFrom.setHours(from[0]);
           openFrom.setMinutes(from[1]);

            var openTo = new Date();
           openTo.setHours(to[0]);
           openTo.setMinutes(to[1]);
           
           return (now >= openFrom  && openTo >= now);           
       }
   }

   public openHourValidForDelay(delay) {
        var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday','friday', 'saturday'];
        let entries = this.config.getConfig("branch_open_hours");

        let day : number;
        var now = new Date(Date.now() + (delay * 60 * 1000));
           day = now.getDay();
           var hours = now.getHours();
           var minutes = now.getMinutes();
           var openHours = entries.find(function(item){
               return item.description === days[day];
           })
           var from = openHours.from.split(":");
           var to = openHours.to.split(":");

           var openFrom = new Date();
           openFrom.setHours(from[0]);
           openFrom.setMinutes(from[1]);

            var openTo = new Date();
           openTo.setHours(to[0]);
           openTo.setMinutes(to[1]);
           
           return (now >= openFrom  && openTo >= now); 
   }
}