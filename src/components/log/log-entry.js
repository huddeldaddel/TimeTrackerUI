import { bindable, inject, observable } from 'aurelia-framework';
import { LogEntryApi } from '../../services/log-entry-api';

class Duration {

    start = "";
    end = "";

    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    getDurationInMinutes() {
        if(!this.start || !this.end) {
            return null;
        }

        let a = new Date();
        a.setHours(this.start.split(":")[0]);
        a.setMinutes(this.start.split(":")[1]);

        let b = new Date(a);
        b.setHours(this.end.split(":")[0]);
        b.setMinutes(this.end.split(":")[1]);

        if(b < a) {
            b.setDate(b.getDate() +1);
        }

        var hours = Math.floor(Math.abs(b - a) / (60 * 60 * 1000));
        var minutes = (Math.abs(b - a) / (60 * 1000)) % 60;
        return hours * 60 + minutes;        
    }

    getDurationAsString() {
        let total = this.getDurationInMinutes();
        if(null == total) {
            return "";
        }

        let hours = Math.floor(total / 60);
        let minutes = total % 60;
        return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
    }        
    
}

@inject(LogEntryApi)
export class LogEntry {

    editMode = false;
    @bindable entry;

    @observable start = "";
    @observable end = "";

    constructor(logEntryApi) {
        this.logEntryApi = logEntryApi;
        this.duration = "";
        this.project = "";
        this.description = "";
    }

    attached() {
        if (!this.entry) {
            this.editMode = true;
        } else {
            this.start = this.entry.Start;
            this.end = this.entry.End;
            this.duration = this.entry.Duration;
            this.project = this.entry.Project;
            this.description = this.entry.Description;
        }
    }

    save() {

    }

    reset() {
        if (!this.entry) {
            this.start = "";
            this.end = "";
            this.duration = "";
            this.project = "";
            this.description = "";
        } else {
            this.start = this.entry.Start;
            this.end = this.entry.End;
            this.duration = this.entry.Duration;
            this.project = this.entry.Project;
            this.description = this.entry.Description;
        }
    }

    toggleMode() {
        this.editMode = true;
    }

    startChanged(newValue, oldValue) {
        this.calculateDuration();
    }

    endChanged(newValue, oldValue) {
        this.calculateDuration();
    }

    calculateDuration() {
        let duration = new Duration(this.start, this.end);
        this.duration = duration.getDurationAsString();        
    }

}