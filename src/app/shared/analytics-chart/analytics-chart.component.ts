import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-analytics-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas></canvas>`
})
export class AnalyticsChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: any;

  private chart: Chart | null = null;
  private isViewReady = false;

  ngAfterViewInit() {
    this.isViewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.renderChart();
    }
  }

    private renderChart() {
        if (!this.isViewReady) return;

        const timeline = this.data?.timeline;

        if (!timeline || !Array.isArray(timeline)) {
            console.warn('Chart: invalid data', this.data);
            return;
        }

        const ctx = this.canvas.nativeElement.getContext('2d');
        if (!ctx) return;

        const labels = timeline.map((t: any) => t.date);
        const revenue = timeline.map((t: any) => t.revenue);
        const orders = timeline.map((t: any) => t.orders);

        if (this.chart) {
            this.chart.destroy();
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59,130,246,0.4)');
        gradient.addColorStop(1, 'rgba(59,130,246,0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenue,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient
                },
                {
                    label: 'Orders',
                    data: orders,
                    borderDash: [6, 6],
                    tension: 0.4
                }
            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }


}