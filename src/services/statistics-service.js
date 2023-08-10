import { StatisticsApi } from './statistics-api';
import { inject } from 'aurelia-framework';

@inject(StatisticsApi)
export class StatisticsService {

    constructor(api) {
        this.api = api;
        this.statistics = null;
    }

    async getCurrentStatistics() {
        if(null == this.statistics) {
            this.statistics = await this.api.getStatistics(new Date().getFullYear());
        }
        return this.statistics;
    }

    async getRecentProjects() {
        let statistics = await this.getCurrentStatistics();
        let result = [];
        let obj = statistics.Year.Projects;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                result.push(key);
            }
        }
        return result;
    }

}