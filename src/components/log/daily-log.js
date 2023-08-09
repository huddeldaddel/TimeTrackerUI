import { bindable, inject } from 'aurelia-framework';
import { LogEntryApi } from '../../services/log-entry-api';

@inject(LogEntryApi)
export class DailyLog {

    @bindable date;

    constructor(logEntryApi) {
        this.logEntryApi = logEntryApi;
        this.collapsed = true;
        this.entries = [];
        this.header = "";
    }

    attached() {        
        this.header = this.formatDate(this.date);        
        this.collapsed = this.header !== this.formatDate(new Date());        
        this.loadEntries();
    }

    formatDate(date = new Date()) {
        const year = date.toLocaleString('default', { year: 'numeric' });
        const month = date.toLocaleString('default', { month: '2-digit' });
        const day = date.toLocaleString('default', { day: '2-digit' });
        return [year, month, day].join('-');
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.loadEntries();
    }

    loadEntries() {
        if(!this.collapsed && this.entries.length === 0) {
            this.logEntryApi.getLogEntries(this.formatDate(this.date))
            .then(x => this.entries = x)
            .catch(error => {          
                console.error(error);
                this.entries = [];
            });
        }
    }

}