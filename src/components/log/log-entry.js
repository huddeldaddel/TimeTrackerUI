import { bindable, inject } from 'aurelia-framework';
import { LogEntryApi } from '../../services/log-entry-api';

@inject(LogEntryApi)
export class LogEntry {
    
    editMode = false;
    @bindable entry;

    constructor(logEntryApi) {
        this.logEntryApi = logEntryApi;        
    }    

    attached() {        
        if(!this.entry) {
            this.editMode = true;
        }
    }

    toggleMode() {
        this.editMode = true;
    }

}