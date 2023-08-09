export class Log {

    constructor() {
        let date = new Date();
        while(date.getDay() != 1) {
            date = new Date(date);
            date.setDate(date.getDate() -1);
        }

        this.weekStart = date;
    }

}