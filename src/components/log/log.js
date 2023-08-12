export class Log {

    constructor() {
        let date = new Date();
        while(date.getDay() != 1) {
            date = new Date(date);
            date.setDate(date.getDate() -1);
        }

        this.weekStart = date;
        this.weekOffset = 0;
        this.days = this.getDaysOfWeek();
    }

    showNextWeek() {
        if(this.weekOffset === 0) {
            return;
        }
        
        this.weekOffset++;
        this.weekStart = new Date(this.weekStart);
        this.weekStart.setDate(this.weekStart.getDate() + 7);
        this.days = this.getDaysOfWeek();
    }

    showPreviousWeek() {
        this.weekOffset--;
        this.weekStart = new Date(this.weekStart);
        this.weekStart.setDate(this.weekStart.getDate() - 7);
        this.days = this.getDaysOfWeek();
    }

    getDaysOfWeek() {
        let result = [this.weekStart];
        let prevDay = this.weekStart;
        for (let d = 0; d < 6; d++) {
            let date = new Date(prevDay);
            date.setDate(date.getDate() + 1);
            prevDay = date;
            if (date <= new Date()) {
                result.push(date);
            }
        }
        return result;
    }

}