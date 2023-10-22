import { inject } from 'aurelia-framework';
import { BindingSignaler } from "aurelia-templating-resources";
import { formatDateAsISO8601 } from '../../utils';
import { AbsenceApi } from '../../services/absence-api';

@inject(AbsenceApi, BindingSignaler)
export class Log {

    absences = { };

    constructor(absenceApi, signaler) {
        this.absenceApi = absenceApi;
        this.signaler = signaler;
        let date = new Date();
        while(date.getDay() != 1) {
            date = new Date(date);
            date.setDate(date.getDate() -1);
        }
        
        this.weekStart = date;
        this.weekOffset = 0;
        this.days = this.getDaysOfWeek();        
        this.loadAbsences();
    }

    showNextWeek() {
        if(this.weekOffset === 0) {
            return;
        }
        
        this.weekOffset++;
        this.weekStart = new Date(this.weekStart);
        this.weekStart.setDate(this.weekStart.getDate() + 7);
        this.days = this.getDaysOfWeek();
        this.loadAbsences();
    }

    showPreviousWeek() {
        this.weekOffset--;
        this.weekStart = new Date(this.weekStart);
        this.weekStart.setDate(this.weekStart.getDate() - 7);
        this.days = this.getDaysOfWeek();
        this.loadAbsences();
    }

    getDaysOfWeek() {
        let result = [this.weekStart];
        let prevDay = this.weekStart;
        for (let d = 0; d < 6; d++) {
            let date = new Date(prevDay);
            date.setDate(date.getDate() + 1);
            prevDay = date;
            if (date <= new Date()) {
                result.push(date);
            }
        }
        return result;
    }

    loadAbsences() {
        const start = this.days[0];
        const end = this.days[6];
        this.absenceApi.getAbsences(start, end).then(a => { 
            this.absences = a; 
            this.signaler.signal('absences-updated');
        });
    }

    getAbsenceForDay(day) {    
        const key = formatDateAsISO8601(day);
        return this.absences[key];                
    }

}