import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../../../core/models';

@Component({
  selector: 'app-hourly-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-4xl bg-tr-paper dark:bg-tr-dark-card
                border border-tr-ink/8 dark:border-tr-dark-ink/8
                shadow-lg p-7"
    >
      <!-- Header -->
      <h2
        class="font-playfair text-[22px] font-medium
                 text-tr-ink dark:text-tr-dark-ink tracking-tight
                 flex justify-between items-baseline mb-5"
      >
        Próximas 8 horas
        <span
          class="font-inter text-[11px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium"
        >
          Temperatura · °C
        </span>
      </h2>

      <!-- Gráfico SVG -->
      <div class="overflow-x-auto scrollbar-hide">
        <div class="min-w-[560px]">
          <svg [attr.viewBox]="'0 0 560 160'" class="w-full overflow-visible">
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#c1694f" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#c1694f" stop-opacity="0" />
              </linearGradient>
            </defs>

            <!-- Área sob a curva -->
            <path *ngIf="areaPath" [attr.d]="areaPath" fill="url(#curveGrad)" />

            <!-- Linha da curva -->
            <path
              *ngIf="linePath"
              [attr.d]="linePath"
              fill="none"
              stroke="#c1694f"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Pontos -->
            <g *ngFor="let p of points; let i = index">
              <circle
                [attr.cx]="p.x"
                [attr.cy]="p.y"
                r="3.5"
                fill="#c1694f"
                opacity="0.7"
              />
            </g>
          </svg>

          <!-- Labels -->
          <div
            class="grid mt-2"
            [style.grid-template-columns]="'repeat(' + points.length + ', 1fr)'"
          >
            <div
              *ngFor="let p of points"
              class="text-center text-[11px]
                        text-tr-ink-soft dark:text-tr-dark-soft"
            >
              {{ p.time }}
              <b
                class="block font-playfair text-base font-medium mt-0.5
                        text-tr-ink dark:text-tr-dark-ink"
              >
                {{ p.temp }}
              </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HourlyChartComponent implements OnChanges {
  @Input() data: WeatherData | null = null;

  points: { x: number; y: number; time: string; temp: number }[] = [];
  linePath = '';
  areaPath = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) this.buildChart();
  }

  private buildChart(): void {
    const hours = this.data!.hourly.slice(0, 8);
    const temps = hours.map((h) => h.temperature);
    const min = Math.min(...temps) - 2;
    const max = Math.max(...temps) + 2;

    const W = 560,
      H = 140,
      PAD = 30;

    this.points = hours.map((h, i) => ({
      x: PAD + (i / (hours.length - 1)) * (W - PAD * 2),
      y: H - ((h.temperature - min) / (max - min)) * H,
      time: new Date(h.time).getHours().toString().padStart(2, '0') + 'h',
      temp: h.temperature,
    }));

    const line = this.points
      .map((p, i) =>
        i === 0
          ? `M ${p.x} ${p.y}`
          : `C ${this.points[i - 1].x + 30} ${this.points[i - 1].y}, ${p.x - 30} ${p.y}, ${p.x} ${p.y}`,
      )
      .join(' ');

    this.linePath = line;
    this.areaPath = `${line} L ${this.points[this.points.length - 1].x} ${H + 20} L ${this.points[0].x} ${H + 20} Z`;
  }
}
