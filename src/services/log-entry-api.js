import { HttpClient, json } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { ConfigService } from './config-service';

@inject(HttpClient)
export class LogEntryApi {

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

    addLogEntry(entry) {
        return this.http.fetch(`/logEntries`, {
            method: 'post',
            body: json(entry)
        })
            .then(response => response.json())
            .then(result => {
                return result;
            });
    }

    deleteLogEntry(entry) {
        return this.http.fetch(`/logEntries/${entry.Id}`, {
            method: 'delete'
        });
    }

    getLogEntries(date) {
        return this.http.fetch(`/logEntries/${date}`)
            .then(response => response.json())
            .then(result => {
                return result;
            });
    }

    getLogEntriesForToday() {
        let formatDate = (date = new Date()) => {
            const year = date.toLocaleString('default', { year: 'numeric' });
            const month = date.toLocaleString('default', { month: '2-digit' });
            const day = date.toLocaleString('default', { day: '2-digit' });
            return [year, month, day].join('-');
        };
        return this.getLogEntries(formatDate());
    }

    updateLogEntry(entry) {
        return this.http.fetch(`/logEntries`, {
            method: 'put',
            body: json(entry)
        })
            .then(response => response.json())
            .then(result => {
                return result;
            });
    }

}