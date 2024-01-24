import { ConfigService } from './services/config-service' 

export class App {  

  mobileMenuVisible = false;

  constructor() {    
    if(ConfigService.hasConfig()) {
      this.activeTab = 'log';
    } else {
      this.activeTab = 'settings';
    }
  } 

  showLog() {
    if(ConfigService.hasConfig()) {
      this.activeTab = 'log';
    } else {
      this.activeTab = 'settings';
    }
  }

  showStatistics() {
    if(ConfigService.hasConfig()) {
      this.activeTab = 'statistics';
    } else {
      this.activeTab = 'settings';
    }
  }

  showSettings() {
    this.activeTab = 'settings';
  }

  toggleMobileMenu() {
    this.mobileMenuVisible = !this.mobileMenuVisible;
  }

}
