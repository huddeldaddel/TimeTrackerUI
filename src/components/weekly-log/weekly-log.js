import { bindable } from 'aurelia-framework';

export class WeeklyLog {

    @bindable start;

    constructor() {
        this.days = [];
    }    

    attached() {        
        this.days = [this.start];
        let prevDay = this.start;
        for(let d = 0; d<6; d++) {
            let date = new Date(prevDay);
            date.setDate(date.getDate() +1);
            prevDay = date;

            if(date <= new Date()) {
                this.days.push(date);
            }
        }
    }
}