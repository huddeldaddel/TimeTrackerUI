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
        this.testRunning = false;
        this.testSuccessful = null;
    }

    saveSettings() {
        ConfigService.updateConfig(new Config(this.apiKey, this.serverUrl));
        window.location.reload();
    }

    reset() {
        this.apiKey = this.initialConfig.apiKey;
        this.serverUrl = this.initialConfig.serverUrl;
    }

    test() {
        this.testRunning = true;
        this.healthApi.testConnection(this.serverUrl)
            .then(x => {
                this.testRunning = false;
                this.testSuccessful = x.Status === "healthy";
            })
            .catch(error => {
                this.testRunning = false;
                this.testSuccessful = false;
            });
    }

    closeHint() {
        this.testSuccessful = null;
    }
}