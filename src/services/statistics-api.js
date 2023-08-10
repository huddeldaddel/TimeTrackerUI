import { HttpClient } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { ConfigService } from './config-service';

@inject(HttpClient)
export class StatisticsApi {

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

    getStatistics(year) {        
        return this.http.fetch(`/statistics/${year}`)
                 .then(response => response.json())
                 .then(result => {
                    return result;
                 });                
    }
    
}