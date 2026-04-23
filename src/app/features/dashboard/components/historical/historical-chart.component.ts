import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricalSummary } from '../../../../core/models';

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
      <h2
        class="font-playfair text-[22px] font-medium
                 text-tr-ink dark:text-tr-dark-ink tracking-tight
                 flex justify-between items-baseline mb-2"
      >
        Histórico de Temperatura
        <span
          class="font-inter text-[11px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium"
        >
          {{ monthName }} · Últimos 4 anos
        </span>
      </h2>

      <!-- Legenda -->
      <div class="flex items-center gap-4 mb-5 flex-wrap">
        <div *ngFor="let s of series" class="flex items-center gap-1.5">
          <span
            class="w-6 h-1.5 rounded-full inline-block"
            [style.background]="s.color"
          ></span>
          <span
            class="font-inter text-[11px]
                       text-tr-ink-soft dark:text-tr-dark-soft"
          >
            {{ s.year }}
          </span>
        </div>
      </div>

      <!-- Gráfico SVG -->
      <div class="overflow-x-auto">
        <div class="min-w-[600px]">
          <svg viewBox="0 0 600 200" class="w-full overflow-visible">
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
                {{ tick.label }}°
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
          </svg>

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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
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
            class="font-playfair text-2xl font-medium
                       text-tr-ink dark:text-tr-dark-ink"
          >
            {{ s.avgTemp }}°
          </span>
          <span class="text-[11px] text-tr-ink-soft dark:text-tr-dark-soft">
            média do mês
          </span>
        </div>
      </div>
    </div>
  `,
})
export class HistoricalChartComponent implements OnChanges {
  @Input() data: HistoricalSummary | null = null;

  series: any[] = [];
  yTicks: { y: number; label: number }[] = [];
  dayLabels: string[] = [];
  monthName = '';

  private colors = ['#c1694f', '#87b5d4', '#7a9e7e', '#f2a65a'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) this.buildChart();
  }

  private buildChart(): void {
    const now = new Date();
    this.monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

    const allData = [this.data!.currentYear, ...this.data!.previousYears];

    const allTemps = allData.flatMap((d) =>
      d.months.map((m: any) => m.tempMean),
    );
    const minTemp = Math.min(...allTemps) - 2;
    const maxTemp = Math.max(...allTemps) + 2;

    const W = 600,
      H = 180,
      PADX = 30,
      PADY = 10;
    const maxDays = Math.max(...allData.map((d) => d.months.length));

    this.yTicks = [0, 0.25, 0.5, 0.75, 1].map((t: number) => ({
      y: PADY + (1 - t) * (H - PADY * 2),
      label: Math.round(minTemp + t * (maxTemp - minTemp)),
    }));

    this.dayLabels = Array.from({ length: 6 }, (_: any, i: number) =>
      String(Math.round((i / 5) * maxDays) + 1),
    );

    this.series = allData.map((d: any, idx: number) => {
      const points = d.months.map((m: any, i: number) => ({
        x: PADX + (i / (maxDays - 1)) * (W - PADX * 2),
        y:
          PADY +
          (1 - (m.tempMean - minTemp) / (maxTemp - minTemp)) * (H - PADY * 2),
      }));

      const line = points
        .map((p: any, i: number) =>
          i === 0
            ? `M ${p.x} ${p.y}`
            : `C ${points[i - 1].x + 20} ${points[i - 1].y}, ${p.x - 20} ${p.y}, ${p.x} ${p.y}`,
        )
        .join(' ');

      const avgTemp = Math.round(
        d.months.reduce((sum: number, m: any) => sum + m.tempMean, 0) /
          d.months.length,
      );

      return {
        year: d.year,
        color: this.colors[idx],
        isCurrentYear: idx === 0,
        linePath: line,
        areaPath:
          points.length > 1
            ? `${line} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`
            : '',
        avgTemp,
      };
    });
  }
}
