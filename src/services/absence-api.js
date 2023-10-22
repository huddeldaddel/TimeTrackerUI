import { HttpClient, json } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { formatDateAsISO8601 } from '../utils';
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
        let fStart = formatDateAsISO8601(start);
        let fEnd = formatDateAsISO8601(end);
        return this.http.fetch(`/absences/${fStart}/${fEnd}`)
            .then(response => response.json())
            .then(result => {
                return result;
            });
    }

    updateAbsences(absence) {
        return this.http.fetch(`/absences`, {
            method: 'put',
            body: json(absence)
        })
            .then(response => response.json())
            .then(result => {
                return result;
            });
    }

}