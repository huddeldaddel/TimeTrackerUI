import { bindable, inject, observable } from 'aurelia-framework';
import { Duration } from '../../model/duration';
import { LogEntryApi } from '../../services/log-entry-api';
import { StatisticsService } from '../../services/statistics-service';

@inject(LogEntryApi, StatisticsService)
export class LogEntry {

    editMode = false;
    @bindable entry;

    @observable start = "";
    @observable end = "";

    constructor(logEntryApi, statisticsService) {
        this.logEntryApi = logEntryApi;
        this.statisticsService = statisticsService;

        this.duration = "";
        this.project = "";
        this.projectSuggestions = [];
        this.description = "";
    }

    attached() {
        if (!this.entry) {
            this.editMode = true;
            this.statisticsService.getRecentProjects().then(p => {
                this.projectSuggestions = p
                this.projectSuggestions.sort();
            });
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