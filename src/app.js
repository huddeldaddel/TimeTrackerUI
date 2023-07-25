export class App {
  
  constructor() {
    this.showSettings = false;
    this.settingsChangedHandler = () => this.toggleSettings();
  }  

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

}
