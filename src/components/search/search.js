import { inject, observable } from 'aurelia-framework';
import { StatisticsApi } from '../../services/statistics-api';

@inject(StatisticsApi)
export class Search {

    loading = false;
    projects = [];
    projectsByYear = {};        
    @observable year = new Date().getFullYear();

    constructor(statisticsApi) {
        this.statisticsApi = statisticsApi;        
    }

    attached() {
        this.loadStatisticsForYear(this.year);
    }

    loadStatisticsForYear(year) {
        this.loading = true;
        this.statisticsApi.getStatistics(year)
            .then(stats => {
                this.loading = false;
                let projects = Object.getOwnPropertyNames(stats.Year.Projects);
                projects.sort();
                this.projectsByYear[year] = projects;
                this.projects = projects;
            })
            .catch(error => {
                console.error(error);
                this.error = error;
                this.loading = false;
                this.projectsByYear[year] = undefined;
                this.projects = [];
            });
    }

    yearChanged() {
        if(this.year > new Date().getFullYear()) {
            this.projects = [];
            return;
        }

        if(!this.projectsByYear[this.year]) {            
            this.loadStatisticsForYear(this.year);            
        } else {            
            this.projects = this.projectsByYear[this.year];
        }
    }

    search() {

    }
}