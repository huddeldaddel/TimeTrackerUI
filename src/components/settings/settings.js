import { Config } from '../../model/config';
import { ConfigService } from '../../services/config-service';
import { bindable } from 'aurelia-framework';

export class Settings {

    @bindable updated;

    constructor() {
        let config = ConfigService.loadConfig();
        this.apiKey = config.apiKey;
        this.serverUrl = config.serverUrl;
    }

    saveSettings() {
        ConfigService.updateConfig(new Config(this.apiKey, this.serverUrl));
        this.raiseSettingsChangedEvent();
    }

    reset() {
        console.log("settings reset");
    }

    raiseSettingsChangedEvent() {                
        if(null != this.updated) {
            this.updated();
        }
    }
}