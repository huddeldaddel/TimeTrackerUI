import { bindable, inject, observable } from 'aurelia-framework';
import { BindingSignaler } from "aurelia-templating-resources";
import { formatDateAsISO8601 } from '../../utils';
import { Duration } from '../../model/duration';
import { LogEntryApi } from '../../services/log-entry-api';

@inject(BindingSignaler, LogEntryApi)
export class DailyLog {

    @bindable date;
    @observable @bindable absence;

    collapsed = true;
    dayStartedAt = "";
    dayEndedAt = "";
    vacation = 0;
    entries = [];
    error = null;
    header = "";
    homeoffice = false;
    loading = false;
    publicholiday = false;
    sickleave = false;
    totalWorkingHours = "";
    weekend = false;
    showWorkingTooMuchWarning = false;

    constructor(signaler, logEntryApi) {
        this.signaler = signaler;
        this.logEntryApi = logEntryApi;
        this.addHook = this.handleAdd.bind(this);
        this.deleteHook = this.handleDelete.bind(this);
        this.updateHook = this.handleUpdate.bind(this);
    }

    attached() {
        this.header = formatDateAsISO8601(this.date);
        this.weekend = (0 === this.date.getDay()) || (6 === this.date.getDay());
        this.collapsed = this.header !== formatDateAsISO8601(new Date());
        this.loadEntries();
    }

    absenceChanged(newValue, oldValue) {        
        this.homeoffice = newValue.HomeOffice;
        this.sickleave = newValue.SickLeave;
        this.publicholiday = newValue.PublicHoliday;
        this.vacation = newValue.Vacation;
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.loadEntries();
    }

    loadEntries() {
        if (!this.collapsed && this.entries.length === 0) {
            this.loading = true;
            this.logEntryApi.getLogEntries(formatDateAsISO8601(this.date))
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
        this.entries = this.entries.filter((entry) => entry.Id !== updatedEntry.Id).concat([updatedEntry]);
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