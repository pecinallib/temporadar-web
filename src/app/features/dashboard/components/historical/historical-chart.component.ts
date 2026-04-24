import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricalSummary } from '../../../../core/models';
import { HistoricalService } from '../../../../core/services';

type Metric = 'temp' | 'wind' | 'humidity';

@Component({
  selector: 'app-historical-chart',
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
        {{ metricLabel }}
        <span
          class="font-inter text-[11px] tracking-widest uppercase
                 text-tr-ink-mute dark:text-tr-dark-mute font-medium"
        >
          {{ monthName }} · {{ selectedYears.length }} ano{{
            selectedYears.length > 1 ? 's' : ''
          }}
        </span>
      </h2>

      <!-- Controles -->
      <div class="flex flex-col gap-4 mb-5">
        <!-- Seletor de métrica -->
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="font-inter text-[11px] tracking-widest uppercase
                       text-tr-ink-mute dark:text-tr-dark-mute font-medium mr-1"
          >
            Métrica
          </span>
          <button
            *ngFor="let m of metrics"
            (click)="selectMetric(m.value)"
            class="px-3 py-1 rounded-full text-xs font-inter font-medium
                   transition-all duration-200 border"
            [class]="
              activeMetric === m.value
                ? 'bg-tr-terra text-tr-cream border-tr-terra'
                : 'bg-transparent text-tr-ink-soft dark:text-tr-dark-soft border-tr-ink/10 dark:border-tr-dark-ink/10 hover:border-tr-terra/50'
            "
          >
            {{ m.label }}
          </button>
        </div>

        <!-- Seletor de anos -->
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="font-inter text-[11px] tracking-widest uppercase
                       text-tr-ink-mute dark:text-tr-dark-mute font-medium mr-1"
          >
            Anos
          </span>
          <button
            *ngFor="let y of availableYears"
            (click)="toggleYear(y)"
            class="px-3 py-1 rounded-full text-xs font-inter font-medium
                   transition-all duration-200 border"
            [class]="
              isYearSelected(y)
                ? 'text-tr-cream border-transparent'
                : 'bg-transparent text-tr-ink-soft dark:text-tr-dark-soft border-tr-ink/10 dark:border-tr-dark-ink/10 hover:border-tr-terra/50'
            "
            [style.background]="isYearSelected(y) ? getYearColor(y) : ''"
          >
            {{ y }}
          </button>
        </div>
      </div>

      <!-- Legenda -->
      <div class="flex items-center gap-4 mb-5 flex-wrap">
        <div *ngFor="let s of series" class="flex items-center gap-1.5">
          <span
            class="w-6 h-1.5 rounded-full inline-block"
            [style.background]="s.color"
          ></span>
          <span
            class="font-inter text-[11px] text-tr-ink-soft dark:text-tr-dark-soft"
          >
            {{ s.year }}
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div
        *ngIf="loadingYears"
        class="flex items-center justify-center py-16
               text-tr-ink-soft dark:text-tr-dark-soft"
      >
        <div class="flex flex-col items-center gap-3">
          <div
            class="w-8 h-8 rounded-full border-2
                      border-tr-terra border-t-transparent animate-spin"
          ></div>
          <span class="font-inter text-xs">Carregando dados...</span>
        </div>
      </div>

      <!-- Gráfico SVG -->
      <div *ngIf="!loadingYears" class="overflow-x-auto">
        <div class="min-w-[600px] relative">
          <svg
            #chartSvg
            viewBox="0 0 600 200"
            class="w-full overflow-visible cursor-crosshair"
            (mousemove)="onMouseMove($event)"
            (mouseleave)="tooltip = null"
          >
            <defs>
              <linearGradient
                *ngFor="let s of series"
                [attr.id]="'histGrad' + s.year"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  [attr.stop-color]="s.color"
                  stop-opacity="0.12"
                />
                <stop
                  offset="100%"
                  [attr.stop-color]="s.color"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>

            <!-- Linhas de grade -->
            <g *ngFor="let tick of yTicks">
              <line
                [attr.x1]="30"
                [attr.x2]="580"
                [attr.y1]="tick.y"
                [attr.y2]="tick.y"
                stroke="currentColor"
                stroke-opacity="0.06"
                stroke-width="1"
              />
              <text
                [attr.x]="24"
                [attr.y]="tick.y + 4"
                text-anchor="end"
                class="fill-current text-tr-ink-mute dark:text-tr-dark-mute"
                font-size="9"
                font-family="Inter"
              >
                {{ tick.label }}{{ metricUnit }}
              </text>
            </g>

            <!-- Área + linha por série -->
            <g *ngFor="let s of series">
              <path
                *ngIf="s.areaPath"
                [attr.d]="s.areaPath"
                [attr.fill]="'url(#histGrad' + s.year + ')'"
              />
              <path
                *ngIf="s.linePath"
                [attr.d]="s.linePath"
                fill="none"
                [attr.stroke]="s.color"
                [attr.stroke-width]="s.isCurrentYear ? 2.5 : 1.5"
                [attr.stroke-dasharray]="s.isCurrentYear ? '' : '4 3'"
                stroke-linecap="round"
                stroke-linejoin="round"
                [attr.opacity]="s.isCurrentYear ? 1 : 0.6"
              />
            </g>

            <!-- Ponto destacado no hover -->
            <circle
              *ngIf="tooltip"
              [attr.cx]="tooltip.x"
              [attr.cy]="tooltip.y"
              r="4"
              [attr.fill]="tooltip.color"
              stroke="white"
              stroke-width="1.5"
            />
          </svg>

          <!-- Tooltip -->
          <div
            *ngIf="tooltip"
            class="absolute pointer-events-none z-20
                   bg-tr-paper dark:bg-tr-dark-card
                   border border-tr-ink/10 dark:border-tr-dark-ink/10
                   rounded-2xl px-3 py-2 shadow-lg font-inter text-xs"
            [style.left.px]="tooltip.screenX + 14"
            [style.top.px]="tooltip.screenY - 44"
          >
            <div class="flex items-center gap-1.5 mb-0.5">
              <span
                class="w-2 h-2 rounded-full"
                [style.background]="tooltip.color"
              ></span>
              <span class="text-tr-ink-mute dark:text-tr-dark-mute text-[10px]">
                {{ tooltip.date }} · {{ tooltip.year }}
              </span>
            </div>
            <span class="font-medium text-tr-ink dark:text-tr-dark-ink text-sm">
              {{ tooltip.value }}{{ metricUnit }}
            </span>
          </div>

          <!-- Labels dias -->
          <div
            class="flex justify-between mt-1 px-7
                   text-[10px] text-tr-ink-mute dark:text-tr-dark-mute font-inter"
          >
            <span *ngFor="let d of dayLabels">{{ d }}</span>
          </div>
        </div>
      </div>

      <!-- Cards resumo -->
      <div
        *ngIf="!loadingYears"
        class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
      >
        <div
          *ngFor="let s of series"
          class="rounded-3xl p-4 flex flex-col gap-1"
          [style.background]="
            s.isCurrentYear ? 'rgba(193,105,79,0.08)' : 'rgba(45,36,24,0.04)'
          "
        >
          <div class="flex items-center gap-1.5 mb-1">
            <span
              class="w-2 h-2 rounded-full"
              [style.background]="s.color"
            ></span>
            <small
              class="text-[10px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium"
            >
              {{ s.year }}{{ s.isCurrentYear ? ' (atual)' : '' }}
            </small>
          </div>
          <span
            class="font-playfair text-2xl font-medium text-tr-ink dark:text-tr-dark-ink"
          >
            {{ s.avgValue }}{{ metricUnit }}
          </span>
          <span class="text-[11px] text-tr-ink-soft dark:text-tr-dark-soft">
            média de {{ monthName }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class HistoricalChartComponent implements OnChanges {
  @Input() data: HistoricalSummary | null = null;
  @Input() lat: number = 0;
  @Input() lon: number = 0;

  @ViewChild('chartSvg') chartSvg!: ElementRef<SVGSVGElement>;

  private historicalService = inject(HistoricalService);

  series: any[] = [];
  yTicks: { y: number; label: number }[] = [];
  dayLabels: string[] = [];
  monthName = '';
  loadingYears = false;
  tooltip: any = null;

  activeMetric: Metric = 'temp';
  metrics = [
    { value: 'temp' as Metric, label: 'Temperatura' },
    { value: 'wind' as Metric, label: 'Vento Máx.' },
    { value: 'humidity' as Metric, label: 'Umidade' },
  ];

  readonly currentYear = new Date().getFullYear();
  availableYears: number[] = Array.from(
    { length: 10 },
    (_, i) => this.currentYear - i,
  );

  selectedYears: number[] = [
    this.currentYear,
    this.currentYear - 1,
    this.currentYear - 2,
    this.currentYear - 3,
  ];

  private yearColors: Record<number, string> = {};
  private allColors = [
    '#c1694f',
    '#87b5d4',
    '#7a9e7e',
    '#f2a65a',
    '#a78bfa',
    '#34d399',
    '#fb923c',
    '#60a5fa',
    '#f472b6',
    '#facc15',
  ];

  private cachedData: Map<number, any> = new Map();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      const all = [this.data.currentYear, ...this.data.previousYears];
      all.forEach((d) => this.cachedData.set(d.year, d));
      this.assignColors();
      this.buildChart();
    }
  }

  private assignColors(): void {
    this.availableYears.forEach((y, i) => {
      if (!this.yearColors[y]) {
        this.yearColors[y] = this.allColors[i % this.allColors.length];
      }
    });
  }

  getYearColor(year: number): string {
    return this.yearColors[year] ?? '#c1694f';
  }

  isYearSelected(year: number): boolean {
    return this.selectedYears.includes(year);
  }

  toggleYear(year: number): void {
    if (this.isYearSelected(year)) {
      if (this.selectedYears.length === 1) return;
      this.selectedYears = this.selectedYears.filter((y) => y !== year);
      this.buildChart();
    } else {
      if (this.cachedData.has(year)) {
        this.selectedYears = [...this.selectedYears, year].sort(
          (a, b) => b - a,
        );
        this.buildChart();
      } else {
        this.loadYear(year);
      }
    }
  }

  private loadYear(year: number): void {
    if (!this.lat && !this.lon) return;
    this.loadingYears = true;
    this.historicalService.fetchYear(this.lat, this.lon, year).subscribe({
      next: (d) => {
        this.cachedData.set(year, d);
        this.selectedYears = [...this.selectedYears, year].sort(
          (a, b) => b - a,
        );
        this.loadingYears = false;
        this.buildChart();
      },
      error: () => {
        this.loadingYears = false;
      },
    });
  }

  selectMetric(m: Metric): void {
    this.activeMetric = m;
    this.buildChart();
  }

  get metricLabel(): string {
    return {
      temp: 'Histórico de Temperatura',
      wind: 'Histórico de Vento Máximo',
      humidity: 'Histórico de Umidade',
    }[this.activeMetric];
  }

  get metricUnit(): string {
    return { temp: '°', wind: ' km/h', humidity: '%' }[this.activeMetric];
  }

  private getMetricValue(m: any): number {
    return (
      { temp: m.tempMean, wind: m.windMax, humidity: m.humidity }[
        this.activeMetric
      ] ?? 0
    );
  }

  onMouseMove(event: MouseEvent): void {
    const svgEl = this.chartSvg?.nativeElement;
    if (!svgEl || this.series.length === 0) return;

    const rect = svgEl.getBoundingClientRect();
    const scaleX = 600 / rect.width;
    const scaleY = 200 / rect.height;
    const svgX = (event.clientX - rect.left) * scaleX;
    const svgY = (event.clientY - rect.top) * scaleY;

    let closest: any = null;
    let minDist = Infinity;

    for (const s of this.series) {
      for (let i = 0; i < s.points.length; i++) {
        const p = s.points[i];
        const dist = Math.sqrt((p.x - svgX) ** 2 + (p.y - svgY) ** 2);
        if (dist < minDist && dist < 20) {
          minDist = dist;
          const d = this.cachedData.get(s.year);
          const month = d?.months[i];
          if (!month) continue;
          const dateStr = new Date(month.date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
          });
          closest = {
            x: p.x,
            y: p.y,
            screenX: event.clientX - rect.left,
            screenY: event.clientY - rect.top,
            color: s.color,
            year: s.year,
            date: dateStr,
            value: this.getMetricValue(month),
          };
        }
      }
    }

    this.tooltip = closest ?? null;
  }

  private buildChart(): void {
    const now = new Date();
    this.monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

    const activeData = this.selectedYears
      .map((y) => this.cachedData.get(y))
      .filter(Boolean);

    const allValues = activeData.flatMap((d) =>
      d.months.map((m: any) => this.getMetricValue(m)),
    );
    const minVal = Math.min(...allValues) - 2;
    const maxVal = Math.max(...allValues) + 2;

    const W = 600,
      H = 180,
      PADX = 30,
      PADY = 10;
    const maxDays = Math.max(...activeData.map((d: any) => d.months.length));

    this.yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PADY + (1 - t) * (H - PADY * 2),
      label: Math.round(minVal + t * (maxVal - minVal)),
    }));

    this.dayLabels = Array.from({ length: 6 }, (_, i) =>
      String(Math.round((i / 5) * maxDays) + 1),
    );

    this.series = activeData.map((d: any) => {
      const isCurrentYear = d.year === this.currentYear;
      const color = this.yearColors[d.year] ?? '#c1694f';

      const points = d.months.map((m: any, i: number) => ({
        x: PADX + (i / Math.max(maxDays - 1, 1)) * (W - PADX * 2),
        y:
          PADY +
          (1 - (this.getMetricValue(m) - minVal) / (maxVal - minVal)) *
            (H - PADY * 2),
      }));

      const line = points
        .map((p: any, i: number) =>
          i === 0
            ? `M ${p.x} ${p.y}`
            : `C ${points[i - 1].x + 20} ${points[i - 1].y}, ${p.x - 20} ${p.y}, ${p.x} ${p.y}`,
        )
        .join(' ');

      const avgValue = Math.round(
        d.months.reduce(
          (sum: number, m: any) => sum + this.getMetricValue(m),
          0,
        ) / d.months.length,
      );

      return {
        year: d.year,
        color,
        isCurrentYear,
        linePath: line,
        points,
        areaPath:
          points.length > 1
            ? `${line} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
            : '',
        avgValue,
      };
    });
  }
}
