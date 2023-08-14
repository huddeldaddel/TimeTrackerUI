import { inject } from 'aurelia-framework';
import { Chart } from 'chart.js/auto'
import { LogEntryApi } from '../../services/log-entry-api';
import { StatisticsApi } from '../../services/statistics-api';


@inject(LogEntryApi, StatisticsApi)
export class Statistics {

    colorPaletteTemplate = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'].reverse();
    colorPalette = [];
    projectColors = {};

    constructor(logEntryApi, statisticsApi) {
        this.logEntryApi = logEntryApi;
        this.statisticsApi = statisticsApi;
        this.error = null;
        this.loadingStats = false;
        this.loadingToday = false;
        this.statistics = null;
        this.todaysEntries = [];
    }

    attached() {
        this.loadingStats = true;
        this.loadingToday = true;

        this.logEntryApi.getLogEntriesForToday()
            .then(entries => {
                this.loadingToday = false;
                this.todaysEntries = entries;
                this.createChartsForToday();
            })
            .catch(error => {
                console.error(error);
                this.error = error;
                this.loadingToday = false;
                this.todaysEntries = [];
            });

        this.statisticsApi.getStatistics(new Date().getFullYear())
            .then(stats => {
                this.loadingStats = false;
                this.statistics = stats;
                this.createCharts();
            })
            .catch(error => {
                console.error(error);
                this.error = error;
                this.loadingStats = false;
                this.statistics = null;
            });
    }

    createCharts() {
        this.createChartForYear();
        this.createChartForMonth();
        this.createChartForWeek();
    }

    createChartForYear() {
        const dataContainer = this.statistics.Year.Projects;
        const { labels, backgroundColors, minutes } = this.computeChartData(dataContainer);
        this.renderChart('year', labels, minutes, backgroundColors);
    }

    createChartForMonth() {
        const month = new Date().getMonth() +1;
        const monthContainer = this.statistics.Months[month];
        if (monthContainer) {
            const { labels, backgroundColors, minutes } = this.computeChartData(monthContainer.Projects);
            this.renderChart('month', labels, minutes, backgroundColors);
        }
    }

    createChartForWeek() {
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)

        const weekContainer = this.statistics.Weeks[week];
        if (weekContainer) {
            const { labels, backgroundColors, minutes } = this.computeChartData(weekContainer.Projects);
            this.renderChart('week', labels, minutes, backgroundColors);
        }
    }

    createChartsForToday() {
        const labels = [];
        const backgroundColors = [];
        const minutes = [];

        this.todaysEntries.forEach((entry) => {
            let projectIdx = labels.indexOf(entry.Project);
            if(-1 === projectIdx) {
                labels.push(entry.Project);
                if (!this.projectColors[entry.Project]) {
                    if (0 == this.colorPalette.length) {
                        this.colorPalette.push(...this.colorPaletteTemplate);
                    }
                    this.projectColors[entry.Project] = this.colorPalette.pop();
                }
                backgroundColors.push(this.projectColors[entry.Project]);
                minutes.push(entry.Duration);
            } else {
                minutes[projectIdx] += entry.Duration;
            }            
        });

        this.renderChart('day', labels, minutes, backgroundColors);        
    }

    computeChartData(dataContainer) {
        const labels = [];
        const backgroundColors = [];
        const minutes = [];

        for (const key in dataContainer) {
            if (dataContainer.hasOwnProperty(key)) {
                if (!this.projectColors[key]) {
                    if (0 == this.colorPalette.length) {
                        this.colorPalette.push(...this.colorPaletteTemplate);
                    }
                    this.projectColors[key] = this.colorPalette.pop();
                }

                labels.push(key);
                backgroundColors.push(this.projectColors[key]);
                minutes.push(dataContainer[key].Duration);
            }
        }

        return {
            "labels": labels,
            "backgroundColors": backgroundColors,
            "minutes": minutes
        };
    }

    renderChart(elementId, labels, minutes, backgroundColors) {
        new Chart(document.getElementById(elementId), {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: minutes,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

}
