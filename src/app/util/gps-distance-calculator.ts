import { Util } from './util';
import { Config } from '../config/config';
export class GpsPositionCalculator {

    
    
    constructor(private config : Config){
    }

    //ref http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula

    public getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
        let util = new Util();
        const unitSystem = this.config.getConfig('system_of_units');
        
        if (unitSystem === 'metric')  {
            return this.getMetricDistance(lat1, lon1, lat2, lon2);
        } else if (unitSystem === 'imperial') {
            return this.getImperialDistance(lat1, lon1, lat2, lon2);
        } else {
            if (util.isImperial()) {
                return this.getImperialDistance(lat1, lon1, lat2, lon2);
            }
            else {
                return this.getMetricDistance(lat1, lon1, lat2, lon2);
            }
        }  
     
    }

    public getRawDiatance(lat1, lon1, lat2, lon2){
        let R = 6371; // Radius of the earth in km
        let dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        let dLon = this.deg2rad(lon2 - lon1);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d: any = R * c; // Distance in km
        return d;
    }

    private getMetricDistance(lat1, lon1, lat2, lon2) {
        let R = 6371; // Radius of the earth in km
        let dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        let dLon = this.deg2rad(lon2 - lon1);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d: any = R * c; // Distance in km

        if (d <= 1) {
            console.log(d);
            d = Math.round(d * 1000) + " m";
        } else {
            d = Math.round(d) + " km";
        }

        return d;
    }

    private getImperialDistance(lat1, lon1, lat2, lon2) {
        let R = 3959; // Radius of the earth in miles
        let dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        let dLon = this.deg2rad(lon2 - lon1);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d: any = R * c; // Distance in miles

        if (d <= 1) {
            d = d.toFixed(2) + " mi";
        } else {
            d = Math.round(d) + " mi";
        }

        return d;
    }

    private deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}
