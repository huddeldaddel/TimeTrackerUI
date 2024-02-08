import { inject, observable } from 'aurelia-framework';
import { LogEntryApi } from '../../services/log-entry-api';
import { StatisticsApi } from '../../services/statistics-api';

@inject(LogEntryApi, StatisticsApi)
export class Search {

    loading = false;
    project = null;
    projects = [];
    projectsByYear = {};        
    query = "";
    results = [];
    @observable year = new Date().getFullYear();

    constructor(logEntryApi, statisticsApi) {
        this.logEntryApi = logEntryApi;
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
        this.project = null;

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
        this.loading = true;
        this.logEntryApi.findLogEntiesForYearAndProject(this.year, this.project, this.query.trim().length === 0 ? null : this.query)
            .then(results => {
                this.loading = false;
                this.results = results;                
                console.info(results);
            })
            .catch(error => {
                console.error(error);
                this.error = error;
                this.loading = false;                
                this.results = [];
            });
    }
}