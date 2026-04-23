import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarineData, MarineHourly } from '../../../../core/models';

@Component({
  selector: 'app-marine-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="rounded-4xl bg-tr-paper dark:bg-tr-dark-card
                border border-tr-ink/8 dark:border-tr-dark-ink/8
                shadow-lg p-7"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2
          class="font-playfair text-[22px] font-medium
                   text-tr-ink dark:text-tr-dark-ink tracking-tight"
        >
          Ondas
        </h2>
        <div class="flex items-center gap-3">
          <span
            class="font-inter text-[11px] tracking-widest uppercase
                       text-tr-ink-mute dark:text-tr-dark-mute font-medium"
          >
            {{ visiblePoints.length }}h visíveis · Altura · m
          </span>
        </div>
      </div>

      <!-- Gráfico SVG -->
      <div class="relative w-full" style="height: 200px;">
        <svg #chartSvg class="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#87b5d4" stop-opacity="0.6" />
              <stop offset="60%" stop-color="#87b5d4" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#87b5d4" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="waveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#5a9ec4" />
              <stop offset="100%" stop-color="#87b5d4" />
            </linearGradient>
          </defs>

          <!-- Grid lines -->
          <g *ngFor="let tick of yTicks">
            <line
              [attr.x1]="0"
              [attr.x2]="chartW"
              [attr.y1]="tick.y"
              [attr.y2]="tick.y"
              stroke="currentColor"
              stroke-opacity="0.06"
              stroke-width="1"
            />
            <text
              [attr.x]="chartW + 8"
              [attr.y]="tick.y + 4"
              font-size="10"
              font-family="Inter"
              class="fill-current text-tr-ink-mute dark:text-tr-dark-mute"
              opacity="0.5"
            >
              {{ tick.label }}m
            </text>
          </g>

          <!-- Área preenchida -->
          <path *ngIf="areaPath" [attr.d]="areaPath" fill="url(#waveGrad)" />

          <!-- Linha principal -->
          <path
            *ngIf="linePath"
            [attr.d]="linePath"
            fill="none"
            stroke="url(#waveStroke)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Pontos com tooltip -->
          <g
            *ngFor="let p of visiblePoints; let i = index"
            (mouseenter)="hoveredIndex = i"
            (mouseleave)="hoveredIndex = -1"
            style="cursor: pointer;"
          >
            <circle
              [attr.cx]="p.x"
              [attr.cy]="p.y"
              [attr.r]="hoveredIndex === i ? 6 : 4"
              fill="#87b5d4"
              [attr.opacity]="hoveredIndex === i ? 1 : 0.7"
              style="transition: r 0.15s ease"
            />

            <!-- Tooltip -->
            <g *ngIf="hoveredIndex === i">
              <rect
                [attr.x]="p.x - 32"
                [attr.y]="p.y - 46"
                width="64"
                height="36"
                rx="8"
                fill="#2d2418"
                fill-opacity="0.85"
              />
              <text
                [attr.x]="p.x"
                [attr.y]="p.y - 28"
                text-anchor="middle"
                font-size="13"
                font-family="Playfair Display, serif"
                fill="white"
                font-weight="500"
              >
                {{ p.height }}m
              </text>
              <text
                [attr.x]="p.x"
                [attr.y]="p.y - 16"
                text-anchor="middle"
                font-size="10"
                font-family="Inter, sans-serif"
                fill="white"
                opacity="0.7"
              >
                {{ p.time }}
              </text>
            </g>
          </g>

          <!-- Labels X -->
          <g *ngFor="let p of visiblePoints; let i = index">
            <text
              *ngIf="i % labelStep === 0"
              [attr.x]="p.x"
              [attr.y]="chartH + 20"
              text-anchor="middle"
              font-size="10"
              font-family="Inter, sans-serif"
              class="fill-current text-tr-ink-soft dark:text-tr-dark-soft"
              opacity="0.7"
            >
              {{ p.time }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Slider de zoom -->
      <div class="mt-6 px-1">
        <div class="flex justify-between mb-2">
          <span
            class="font-inter text-[10px] tracking-widest uppercase
                       text-tr-ink-mute dark:text-tr-dark-mute font-medium"
          >
            Zoom
          </span>
          <span
            class="font-inter text-[10px] text-tr-ink-mute dark:text-tr-dark-mute"
          >
            {{ visiblePoints.length }}h de {{ data?.hourly?.length || 0 }}h
            disponíveis
          </span>
        </div>

        <!-- Range slider -->
        <input
          type="range"
          [min]="6"
          [max]="totalHours"
          [step]="1"
          [value]="visiblePoints.length"
          (input)="onZoom($event)"
          class="w-full h-1.5 rounded-full appearance-none cursor-pointer
         bg-tr-sand dark:bg-tr-dark-sand accent-tr-sky"
        />

        <!-- Tick atual -->
        <div class="relative mt-1 h-4">
          <span
            class="absolute font-inter text-[9px] font-medium text-tr-sky dark:text-tr-sky"
            [style.left]="sliderPercent + '%'"
            style="transform: translateX(-50%)"
          >
            {{ visiblePoints.length }}h
          </span>
        </div>
      </div>
    </div>
  `,
})
export class MarineChartComponent implements OnChanges, AfterViewInit {
  @Input() data: MarineData | null = null;
  @ViewChild('chartSvg') chartSvg!: ElementRef;

  visibleHours = 12;
  totalHours = 24;
  hoveredIndex = -1;

  chartW = 520;
  chartH = 160;

  allPoints: { x: number; y: number; time: string; height: number }[] = [];
  visiblePoints: { x: number; y: number; time: string; height: number }[] = [];
  yTicks: { y: number; label: number }[] = [];
  linePath = '';
  areaPath = '';

  get labelStep(): number {
    if (this.visibleHours <= 12) return 1;
    if (this.visibleHours <= 24) return 2;
    return 4;
  }

  get sliderPercent(): number {
    return ((this.visiblePoints.length - 6) / (this.totalHours - 6)) * 100;
  }

  ngAfterViewInit(): void {
    if (this.chartSvg?.nativeElement) {
      this.chartW = this.chartSvg.nativeElement.clientWidth - 40;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.totalHours = Math.min(48, this.data.hourly.length);
      this.buildChart();
    }
  }

  onZoom(event: Event): void {
    this.visibleHours = Number((event.target as HTMLInputElement).value);
    this.buildChart();
  }

  private buildChart(): void {
    if (!this.data) return;

    const available = Math.min(this.visibleHours, this.data.hourly.length);
    const hours = this.data.hourly.slice(0, available);

    if (hours.length < 2) return;

    const heights = hours.map((h: MarineHourly) => h.waveHeight);
    const minH = Math.max(0, Math.min(...heights) - 0.3);
    const maxH = Math.max(...heights) + 0.3;
    const range = maxH - minH || 1;

    const W = this.chartW;
    const H = this.chartH;
    const PAD = 10;

    this.yTicks = [0, 0.33, 0.66, 1].map((t) => ({
      y: H - t * H,
      label: Math.round((minH + t * range) * 10) / 10,
    }));

    this.visiblePoints = hours.map((h: MarineHourly, i: number) => ({
      x: PAD + (i / (hours.length - 1)) * (W - PAD * 2),
      y: H - ((h.waveHeight - minH) / range) * H,
      time: new Date(h.time).getHours().toString().padStart(2, '0') + 'h',
      height: h.waveHeight,
    }));

    const line = this.visiblePoints
      .map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = this.visiblePoints[i - 1];
        const cpx = (prev.x + p.x) / 2;
        return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
      })
      .join(' ');

    this.linePath = line;
    this.areaPath = `${line} L ${this.visiblePoints[this.visiblePoints.length - 1].x} ${H} L ${this.visiblePoints[0].x} ${H} Z`;
  }
}
