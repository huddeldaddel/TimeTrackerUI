import { bindable, inject, observable } from 'aurelia-framework';
import { LogEntryApi } from '../../services/log-entry-api';

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
        if("" !== this.start && "" !== this.end) {
            console.debug("duration", this.start, this.end);
        }
    }

}