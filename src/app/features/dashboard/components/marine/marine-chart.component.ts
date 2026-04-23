import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarineData, MarineHourly } from '../../../../core/models';

@Component({
  selector: 'app-marine-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="rounded-4xl bg-tr-paper dark:bg-tr-dark-card
                border border-tr-ink/8 dark:border-tr-dark-ink/8
                shadow-lg p-7"
    >
      <h2
        class="font-playfair text-[22px] font-medium
                 text-tr-ink dark:text-tr-dark-ink tracking-tight
                 flex justify-between items-baseline mb-5"
      >
        Ondas — Próximas 24h
        <span
          class="font-inter text-[11px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium"
        >
          Altura · m
        </span>
      </h2>

      <div class="overflow-x-auto">
        <div class="min-w-[560px]">
          <svg viewBox="0 0 560 160" class="w-full overflow-visible">
            <defs>
              <linearGradient id="marineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#87b5d4" stop-opacity="0.25" />
                <stop offset="100%" stop-color="#87b5d4" stop-opacity="0" />
              </linearGradient>
            </defs>

            <path
              *ngIf="areaPath"
              [attr.d]="areaPath"
              fill="url(#marineGrad)"
            />

            <path
              *ngIf="linePath"
              [attr.d]="linePath"
              fill="none"
              stroke="#87b5d4"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <g *ngFor="let p of points">
              <circle
                [attr.cx]="p.x"
                [attr.cy]="p.y"
                r="3.5"
                fill="#87b5d4"
                opacity="0.7"
              />
            </g>
          </svg>

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
                {{ p.height }}m
              </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MarineChartComponent implements OnChanges {
  @Input() data: MarineData | null = null;

  points: { x: number; y: number; time: string; height: number }[] = [];
  linePath = '';
  areaPath = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) this.buildChart();
  }

  private buildChart(): void {
    const hours = this.data!.hourly.slice(0, 8);
    const heights = hours.map((h: MarineHourly) => h.waveHeight);
    const min = Math.max(0, Math.min(...heights) - 0.5);
    const max = Math.max(...heights) + 0.5;

    const W = 560,
      H = 140,
      PAD = 30;

    this.points = hours.map((h: MarineHourly, i: number) => ({
      x: PAD + (i / (hours.length - 1)) * (W - PAD * 2),
      y: H - ((h.waveHeight - min) / (max - min)) * H,
      time: new Date(h.time).getHours().toString().padStart(2, '0') + 'h',
      height: h.waveHeight,
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
