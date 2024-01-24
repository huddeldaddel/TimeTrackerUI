import { Config } from './../model/config';

export class ConfigService {

  /**
   * Returns whether or not the application has been configured.
   */
  static hasConfig() {
    const json = localStorage.getItem("config");
    return !!json;      
  }

  /**
   * Loads the configuration. Returns null if the configuration hasn't been stored, yet.
   */
  static loadConfig() {
    const json = localStorage.getItem("config");
    if (json) {
      return JSON.parse(json);
    }
    return new Config();
  }

  /**
   * Updates the configuration.
   */
  static updateConfig(config) {
    localStorage.setItem("config", JSON.stringify(config));
  }
}