import { inject } from 'aurelia-framework';
import { Chart } from 'chart.js/auto'
import { LogEntryApi } from '../../services/log-entry-api';
import { StatisticsApi } from '../../services/statistics-api';
import { formatDateAsISO8601 } from '../../utils';


@inject(LogEntryApi, StatisticsApi)
export class Statistics {

    colorPaletteTemplate = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'].reverse();
    colorPalette = [];    
    projectColors = {};
    canMoveToNextDay = false;
    canMoveToNextWeek = false;
    canMoveToNextMonth = false;
    canMoveToNextYear = false;

    constructor(logEntryApi, statisticsApi) {
        this.logEntryApi = logEntryApi;
        this.statisticsApi = statisticsApi;
        this.error = null;
        this.loadingStats = false;
        this.loadingToday = false;
        this.selectedDay = formatDateAsISO8601(new Date());
        this.selectedWeek = formatDateAsISO8601(new Date());
        this.selectedMonth = {
            year: new Date().getFullYear(),
            month: new Date().toLocaleString('default', { month: '2-digit' })
        };
        this.selectedYear = new Date().getFullYear();
        this.statistics = null;
        this.statisticsByYear = {};
        this.todaysEntries = [];
        this.charts = { day: null, week: null, month: null, year: null};
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
        if(null != this.charts.day) {
            this.charts.day.destroy();
            this.charts.day = null;
        }
        if(null != this.charts.week) {
            this.charts.week.destroy();
            this.charts.week = null;
        }
        if(null != this.charts.month) {
            this.charts.month.destroy();
            this.charts.month = null;
        }
        if(null != this.charts.year) {
            this.charts.year.destroy();
            this.charts.year = null;
        }
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
        if(null != this.charts.year) {
            this.charts.year.destroy();
            this.charts.year = null;
        }
        const dataContainer = this.statisticsByYear[this.selectedYear].Year.Projects;
        const { labels, backgroundColors, minutes } = this.computeChartData(dataContainer);
        this.charts.year = this.renderChart('year', labels, minutes, backgroundColors);
    }

    createChartForMonth() {
        if(null != this.charts.month) {
            this.charts.month.destroy();
            this.charts.month = null;
        }
        const monthContainer = this.statisticsByYear[this.selectedMonth.year].Months[parseInt(this.selectedMonth.month, 10)];
        if (monthContainer) {
            const { labels, backgroundColors, minutes } = this.computeChartData(monthContainer.Projects);
            this.charts.month = this.renderChart('month', labels, minutes, backgroundColors);
        }
    }

    createChartForWeek() {
        if(null != this.charts.week) {
            this.charts.week.destroy();
            this.charts.week = null;
        }
        const now = new Date(this.selectedWeek);
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)

        const weekContainer = this.statisticsByYear[yearStart.getFullYear()].Weeks[week];
        if (weekContainer) {
            const { labels, backgroundColors, minutes } = this.computeChartData(weekContainer.Projects);
            this.charts.week = this.renderChart('week', labels, minutes, backgroundColors);
        }
    }

    createChartsForToday() {
        if(null != this.charts.day) {
            this.charts.day.destroy();
            this.charts.day = null;
        }

        const labels = [];
        const backgroundColors = [];
        const minutes = [];

        this.todaysEntries.forEach((entry) => {
            let projectIdx = labels.indexOf(entry.Project);
            if (-1 === projectIdx) {
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

        this.charts.day = this.renderChart('day', labels, minutes, backgroundColors);
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
        return newChart;
    }

    showPreviousMonth() {
        if("01" === this.selectedMonth.month) {
            this.selectedMonth = {
                year: this.selectedMonth.year -1,
                month: "12"
            };
            this.loadStatisticsForMonthChart();
        } else {
            var m = parseInt(this.selectedMonth.month, 10) -1;
            this.selectedMonth.month = (m < 10) ? `0${m}` : `${m}`;
            this.createChartForMonth();
        }
        this.canMoveToNextMonth = true;
    }

    showNextMonth() {
        if(!this.canMoveToNextMonth) 
            return;

        if("12" === this.selectedMonth.month) {
            this.selectedMonth = {
                year: this.selectedMonth.year +1,
                month: "01"
            };
            this.loadStatisticsForMonthChart();
        } else {
            var m = parseInt(this.selectedMonth.month, 10) +1;
            this.selectedMonth.month = (m < 10) ? `0${m}` : `${m}`;
            this.createChartForMonth();
        }
        this.canMoveToNextMonth = !this.isCurrentMonthSelected();
    }

    loadStatisticsForMonthChart() {
        if(!this.statisticsByYear[this.selectedMonth.year]) {
            this.loadingStats = true;
            this.statisticsApi.getStatistics(this.selectedMonth.year)
                .then(stats => {
                    this.loadingStats = false;
                    this.statisticsByYear[this.selectedMonth.year] = stats;
                    this.createChartForMonth();
                })
                .catch(error => {
                    console.error(error);
                    this.error = error;
                    this.loadingStats = false;
                    this.statisticsByYear[year] = undefined;
                });
        } else {
            this.createChartForMonth();
        }
    }

    isCurrentMonthSelected() {
        let today = new Date();                   
        var thisMonth = [
            today.toLocaleString('default', { year: 'numeric' }), 
            today.toLocaleString('default', { month: '2-digit' })
        ].join('-');
        return `${this.selectedMonth.year}-${this.selectedMonth.month}` === thisMonth;
    }

    showPreviousYear() {
        this.selectedYear = this.selectedYear -1;
        this.loadStatisticsForYearChart();        
        this.canMoveToNextYear = true;
    }

    showNextYear() {
        if(!this.canMoveToNextYear)
            return;

        this.selectedYear = this.selectedYear +1;
        this.loadStatisticsForYearChart();        
        this.canMoveToNextYear = this.selectedYear < new Date().getFullYear();
    }

    loadStatisticsForYearChart() {
        if(!this.statisticsByYear[this.selectedYear]) {
            this.loadingStats = true;
            this.statisticsApi.getStatistics(this.selectedYear)
                .then(stats => {
                    this.loadingStats = false;
                    this.statisticsByYear[this.selectedYear] = stats;
                    this.createChartForYear();
                })
                .catch(error => {
                    console.error(error);
                    this.error = error;
                    this.loadingStats = false;
                    this.statisticsByYear[year] = undefined;
                });
        } else {
            this.createChartForYear();
        }
    }

}
