import { HttpClient, json } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { ConfigService } from './config-service';

@inject(HttpClient)
export class AbsenceApi {

    constructor(http) {
        this.http = http;
        const config = ConfigService.loadConfig();
        http.configure(cfg => {
            cfg.withBaseUrl(config?.serverUrl);
            cfg.withDefaults({
                cache: 'no-cache',
                headers: {
                    'x-functions-key': config?.apiKey
                }
            });
        });
    }

    getAbsences(start, end) {
        let fStart = this.formatDate(start);
        let fEnd = this.formatDate(end);
        return this.http.fetch(`/absences/${fStart}/${fEnd}`)
            .then(response => response.json())
            .then(result => {
                return result;
            });
    }

    formatDate(date) {
        const year = date.toLocaleString('default', { year: 'numeric' });
        const month = date.toLocaleString('default', { month: '2-digit' });
        const day = date.toLocaleString('default', { day: '2-digit' });
        return [year, month, day].join('-');
    }

}