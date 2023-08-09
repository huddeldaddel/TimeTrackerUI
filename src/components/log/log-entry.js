import { bindable, inject } from 'aurelia-framework';
import { LogEntryApi } from '../../services/log-entry-api';

@inject(LogEntryApi)
export class LogEntry {

    @bindable entry;

    constructor(logEntryApi) {
        this.logEntryApi = logEntryApi;        
    }

}