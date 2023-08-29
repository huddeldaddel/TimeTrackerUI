export class App {  

  mobileMenuVisible = false;

  constructor() {
    this.activeTab = 'log';        
  } 

  showLog() {
    this.activeTab = 'log';
  }

  showStatistics() {
    this.activeTab = 'statistics';
  }

  showSettings() {
    this.activeTab = 'settings';
  }

  toggleMobileMenu() {
    this.mobileMenuVisible = !this.mobileMenuVisible;
  }

}
