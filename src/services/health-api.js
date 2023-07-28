import {HttpClient, json} from 'aurelia-fetch-client';
import {inject} from 'aurelia-framework';

@inject(HttpClient)
export class HealthApi {

    constructor(http) {
        this.http = http;                
    }

    testConnection(serverUrl) {
        return this.http.fetch(`${serverUrl}/health`)
                 .then(response => response.json())
                 .then(result => {
                    return result;
                 });                
    }
}