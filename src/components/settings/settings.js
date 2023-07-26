import { inject } from 'aurelia-framework';
import { Config } from '../../model/config';
import { ConfigService } from '../../services/config-service';
import { HealthApi } from '../../services/health-api';

@inject(HealthApi)
export class Settings {

    constructor(healthApi) {        
        this.healthApi = healthApi;
        this.initialConfig = ConfigService.loadConfig();
        this.apiKey = this.initialConfig.apiKey;
        this.serverUrl = this.initialConfig.serverUrl;
    }

    saveSettings() {
        ConfigService.updateConfig(new Config(this.apiKey, this.serverUrl));
        window.location.reload();
    }

    reset() {
        this.apiKey = this.initialConfig.apiKey;
        this.serverUrl = this.initialConfig.serverUrl;
    }    

    testConfiguration() {
        this.healthApi.testConnection(this.serverUrl, this.apiKey).then(x => console.log(x));
    }
}