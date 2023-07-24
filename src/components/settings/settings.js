export class Settings {

    constructor() {
        this.apiKey = "initial key";
        this.serverUrl = "https://server.url";
    }

    saveSettings() {
        console.log("save settings");
    }

    reset() {
        console.log("settings reset");
    }
}