import { HttpClient, json } from 'aurelia-fetch-client';
import { inject } from 'aurelia-framework';
import { ConfigService } from './config-service';

@inject(HttpClient)
export class LogEntryService {

    constructor(http) {
        this.http = http;        
        http.configure(cfg => {
            const config = ConfigService.loadConfig;
            cfg.withBaseUrl(config?.serverUrl);
            cfg.withDefaults({
                mode: 'no-cors',
                cache: 'no-cache',
                headers: {
                    'x-functions-key': config?.apiKey
                }
            });
        });
    }
    
}