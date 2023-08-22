import { bindable, inject, observable } from 'aurelia-framework';
import { Duration } from '../../model/duration';
import { LogEntry as LogEntryModel } from '../../model/log-entry';
import { LogEntryApi } from '../../services/log-entry-api';
import { StatisticsService } from '../../services/statistics-service';

@inject(LogEntryApi, StatisticsService)
export class LogEntry {

    editMode = false;
    @bindable date;
    @bindable entry;
    @bindable onadd;
    @bindable ondelete;
    @bindable onupdate;

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
            this.duration = Duration.formatDurationMinutes(this.entry.Duration);
            this.project = this.entry.Project;
            this.description = this.entry.Description;
        }
    }

    save(event) {
        event.stopPropagation();

        if (!this.entry) {
            this.createNewRecord();
        } else {
            this.updateExistingRecord();
        }
    }

    createNewRecord() {
        let leModel = new LogEntryModel();
        leModel.Date = this.date;
        leModel.Description = this.description;
        leModel.End = this.end;
        leModel.Id = !!this.entry ? this.entry.Id : null;
        leModel.Project = this.project;
        leModel.Start = this.start;

        this.logEntryApi.addLogEntry(leModel)
            .then(newEntry => {
                if (!this.entry && this.onadd) {                    
                    this.reset(null);
                    this.onadd(newEntry);
                }
            })
            .catch(error => console.error("Adding a log entry failed", error));
    }

    updateExistingRecord() {
        this.entry.Start = this.start;
        this.entry.End = this.end;
        this.entry.Project = this.project;
        this.entry.Description = this.description;
        this.logEntryApi.updateLogEntry(this.entry)
            .then(x => { 
                this.editMode = false;
                if(this.onupdate) {
                    this.onupdate(this.entry);
                }
            })
            .catch(error => console.error("Updating a log entry failed", error));
    }

    reset(event) {
        if(!!event) {
            event.stopPropagation();
        }        

        if (!this.entry) {
            this.start = "";
            this.end = "";
            this.duration = "";
            this.project = "";
            this.description = "";
        } else {
            this.start = this.entry.Start;
            this.end = this.entry.End;
            this.duration = this.formatDurationMinutes(this.entry.Duration);
            this.project = this.entry.Project;
            this.description = this.entry.Description;
            this.editMode = false;
        }
    }

    delete(event) {        
        event.stopPropagation();

        this.logEntryApi.deleteLogEntry(this.entry)
            .then(() => {
                if (this.entry && this.ondelete) {                    
                    this.ondelete(this.entry);
                }
            })
            .catch(error => console.error("Deleting a log entry failed", error));
    }

    toggleMode() {        
        this.editMode = true;
    }

    startChanged() {
        this.calculateDuration();
    }

    endChanged() {
        this.calculateDuration();
    }

    calculateDuration() {
        let duration = new Duration(this.start, this.end);
        this.duration = duration.getDurationAsString();
    }

}