export class Duration {

    start = "";
    end = "";

    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    getDurationInMinutes() {
        if(!this.start || !this.end) {
            return null;
        }

        let a = new Date();
        a.setHours(this.start.split(":")[0]);
        a.setMinutes(this.start.split(":")[1]);

        let b = new Date(a);
        b.setHours(this.end.split(":")[0]);
        b.setMinutes(this.end.split(":")[1]);

        if(b < a) {
            b.setDate(b.getDate() +1);
        }

        var hours = Math.floor(Math.abs(b - a) / (60 * 60 * 1000));
        var minutes = (Math.abs(b - a) / (60 * 1000)) % 60;
        return hours * 60 + minutes;        
    }

    getDurationAsString() {
        let total = this.getDurationInMinutes();
        if(null == total) {
            return "";
        }

        let hours = Math.floor(total / 60);
        let minutes = total % 60;
        return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
    }        
    
    static formatDurationMinutes(total) {
        let hours = Math.floor(total / 60);
        let minutes = total % 60;
        return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`
    }

}