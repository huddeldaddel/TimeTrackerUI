import { inject } from 'aurelia-framework';
import { Chart } from 'chart.js/auto'
import { LogEntryApi } from '../../services/log-entry-api';
import { StatisticsApi } from '../../services/statistics-api';
import { formatDateAsISO8601, formatDateAsISO8601Month } from '../../utils';


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
        this.selectedDay = formatDateAsISO8601(new Date());
        this.selectedWeek = formatDateAsISO8601(new Date());
        this.selectedMonth = formatDateAsISO8601Month(new Date());        
        this.selectedYear = new Date().getFullYear();        
        this.statistics = null;
        this.statisticsByYear = {};
        this.todaysEntries = [];
        this.charts = [];
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

        this.loadStatisticsForYear(new Date().getFullYear());
    }

    detached() {
        for(var i=0; i<this.charts.length; i++) {
            this.charts[i].destroy();
        }
        this.charts = [];
    }

    loadStatisticsForYear(year) {
        this.loadingStats = true;
        this.statisticsApi.getStatistics(year)
            .then(stats => {
                this.loadingStats = false;
                this.statisticsByYear[year] = stats;                
                this.createCharts();
            })
            .catch(error => {
                console.error(error);
                this.error = error;
                this.loadingStats = false;
                this.statisticsByYear[year] = undefined;
            });
    }

    createCharts() {
        this.createChartForYear();
        this.createChartForMonth();
        this.createChartForWeek();
    }

    createChartForYear() {
        const dataContainer = this.statisticsByYear[this.selectedYear].Year.Projects;
        const { labels, backgroundColors, minutes } = this.computeChartData(dataContainer);
        this.renderChart('year', labels, minutes, backgroundColors);
    }

    createChartForMonth() {        
        const month = parseInt(this.selectedMonth.split("-")[1], 10);
        const monthContainer = this.statisticsByYear[this.selectedMonth.split("-")[0]].Months[month];
        if (monthContainer) {
            const { labels, backgroundColors, minutes } = this.computeChartData(monthContainer.Projects);
            this.renderChart('month', labels, minutes, backgroundColors);
        }
    }

    createChartForWeek() {
        const now = new Date(this.selectedWeek);
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)

        const weekContainer = this.statisticsByYear[yearStart.getFullYear()].Weeks[week];
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
        let newChart = new Chart(document.getElementById(elementId), {
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
        this.charts.push(newChart);
    }

}
