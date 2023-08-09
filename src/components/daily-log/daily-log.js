import { bindable } from 'aurelia-framework';

export class DailyLog {

    @bindable date;

    constructor() {
        this.collapsed = true;
        this.header = "";
    }

    attached() {        
        this.header = this.formatDate(this.date);        
        this.collapsed = this.header !== this.formatDate(new Date());
    }

    formatDate(date = new Date()) {
        const year = date.toLocaleString('default', { year: 'numeric' });
        const month = date.toLocaleString('default', { month: '2-digit' });
        const day = date.toLocaleString('default', { day: '2-digit' });
        return [year, month, day].join('-');
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
    }

}