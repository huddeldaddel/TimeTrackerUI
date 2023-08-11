import { inject } from 'aurelia-framework';
import { Chart } from 'chart.js/auto'
import { StatisticsApi } from '../../services/statistics-api';


@inject(StatisticsApi)
export class Statistics {

    colorPaletteTemplate = ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'].reverse();
    colorPalette = [];
    projectColors = {};

    constructor(api) {
        this.api = api;
        this.error = null;
        this.loading = false;
        this.stats = null;
    }

    attached() {
        this.loading = false;
        this.api.getStatistics(new Date().getFullYear())
            .then(stats => {
                this.error = null;
                this.loading = false;
                this.statistics = stats;
                this.createCharts();
            })
            .catch(error => {
                this.error = error;
                this.loading = false;
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
        const month = new Date().getMonth();
        const monthContainer = this.statistics.Months[month];
        if(monthContainer) {
            const { labels, backgroundColors, minutes } = this.computeChartData(monthContainer.Projects);
            this.renderChart('month', labels, minutes, backgroundColors);        
        }
    }

    createChartForWeek() {
        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const week = Math.ceil((((d - yearStart) / 86400000) + 1)/7)
        
        const weekContainer = this.statistics.Weeks[week];
        if(weekContainer) {
            const { labels, backgroundColors, minutes } = this.computeChartData(weekContainer.Projects);
            this.renderChart('week', labels, minutes, backgroundColors);        
        }
    }

    computeChartData(dataContainer) {
        const labels = [];
        const backgroundColors = [];
        const minutes = [];

        for (const key in dataContainer) {
            if (dataContainer.hasOwnProperty(key)) {
                if (!this.projectColors[key]) {
                    if(0 == this.colorPalette.length) {
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