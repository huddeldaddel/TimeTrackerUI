import { bindable, inject } from 'aurelia-framework';
import { BindingSignaler } from "aurelia-templating-resources";
import { Duration } from '../../model/duration';
import { LogEntryApi } from '../../services/log-entry-api';

@inject(BindingSignaler, LogEntryApi)
export class DailyLog {

    @bindable date;

    dayStartedAt = "";
    dayEndedAt = "";
    totalWorkingHours = "";
    showWorkingTooMuchWarning = false;    

    constructor(signaler, logEntryApi) {
        this.signaler = signaler;
        this.logEntryApi = logEntryApi;
        this.collapsed = true;
        this.entries = [];
        this.error = null;
        this.loading = false;
        this.header = "";

        this.addHook = this.handleAdd.bind(this);
        this.deleteHook = this.handleDelete.bind(this);
        this.updateHook = this.handleUpdate.bind(this);
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
        if (!this.collapsed && this.entries.length === 0) {
            this.loading = true;
            this.logEntryApi.getLogEntries(this.formatDate(this.date))
                .then(x => {
                    this.entries = x;
                    this.sortEntries();
                    this.error = null;
                    this.loading = false;
                })
                .catch(error => {
                    this.error = error;
                    this.entries = [];
                    this.loading = false;
                });
        }
    }

    handleAdd(newEntry) {
        this.entries = this.entries.concat([newEntry]);
        this.sortEntries();
        this.signaler.signal('entries-updated');
    }

    handleDelete(deletedEntry) {
        this.entries = this.entries.filter((entry) => entry.Id !== deletedEntry.Id);
        this.sortEntries();
        this.signaler.signal('entries-updated');
    }

    handleUpdate(updatedEntry) {
        this.entries = this.entries.filter((entry) => entry.Id !== deletedEntry.Id).concat([updatedEntry]);
        this.sortEntries();
        this.signaler.signal('entries-updated');
    }

    sortEntries() {
        this.entries.sort((a, b) => {
            return `${a.Date} ${a.Start}`.localeCompare(`${b.Date} ${b.Start}`);
        });

        if (0 < this.entries.length) {
            this.dayStartedAt = this.entries[0].Start;
            this.dayEndedAt = this.entries[this.entries.length - 1].End;

            const totalDuration = this.entries.map(e => e.Duration).reduce((a, b) => a + b, 0);
            this.totalWorkingHours = Duration.formatDurationMinutes(totalDuration);
            this.showWorkingTooMuchWarning = 600 < totalDuration;
        } else {
            this.dayStartedAt = "";
            this.dayEndedAt = "";
            this.totalWorkingHours = "";
        }
    }

    isOverlapping(logEntry) {
        return this.entries
            .filter((e) => e.Id !== logEntry.Id)
            .some((e) => (e.Start <= logEntry.Start) && (e.End > logEntry.Start));

    }

}