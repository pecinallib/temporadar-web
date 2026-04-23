import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../../../core/models';
import { getWeatherInfo } from '../../../../core/services';

@Component({
  selector: 'app-forecast-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="data" class="mt-7">
      <h2
        class="font-playfair text-[22px] font-medium
                 text-tr-ink dark:text-tr-dark-ink tracking-tight
                 flex justify-between items-baseline mb-4"
      >
        Próximos 7 dias
        <span
          class="font-inter text-[11px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium"
        >
          {{ dateRange }}
        </span>
      </h2>

      <div class="overflow-x-auto scrollbar-hide">
        <div class="grid grid-cols-7 gap-3 min-w-[640px]">
          <div
            *ngFor="let day of data.daily; let i = index"
            [class]="getDayClass(i)"
            class="relative rounded-[26px] p-4 flex flex-col gap-2.5
                      transition-transform duration-300 hover:-translate-y-1 cursor-default"
          >
            <!-- Ícone -->
            <span class="absolute top-3.5 right-3.5 text-xl">
              {{ getInfo(day.weatherCode).icon }}
            </span>

            <!-- Dia -->
            <span
              class="text-[10.5px] tracking-widest uppercase font-medium"
              [class]="
                i === 0
                  ? 'text-[#f1d9b8]'
                  : 'text-tr-ink-soft dark:text-tr-dark-soft'
              "
            >
              {{ i === 0 ? 'Hoje' : getDayName(day.date) }}
            </span>

            <!-- Temp max -->
            <span
              class="font-playfair text-[34px] font-medium
                         leading-none tracking-tight"
              [class]="
                i === 0 ? 'text-tr-cream' : 'text-tr-ink dark:text-tr-dark-ink'
              "
            >
              {{ convert(day.tempMax) }}°
            </span>

            <!-- Temp min -->
            <span
              class="text-xs"
              [class]="
                i === 0
                  ? 'text-[#c5b299]'
                  : 'text-tr-ink-mute dark:text-tr-dark-mute'
              "
            >
              Baixa {{ convert(day.tempMin) }}°
            </span>

            <!-- Condição -->
            <span
              class="text-[11.5px] mt-auto"
              [class]="
                i === 0
                  ? 'text-[#d8c4a6]'
                  : 'text-tr-ink-soft dark:text-tr-dark-soft'
              "
            >
              {{ getInfo(day.weatherCode).label }}
            </span>

            <!-- Chuva -->
            <span
              class="flex items-center gap-1 text-[11px]"
              [class]="
                i === 0
                  ? 'text-[#c5b299]'
                  : 'text-tr-ink-mute dark:text-tr-dark-mute'
              "
            >
              🌧 {{ day.precipitationProbability }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ForecastStripComponent {
  @Input() data: WeatherData | null = null;
  @Input() unit: 'C' | 'F' = 'C';

  convert(celsius: number): number {
    if (this.unit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  }

  getInfo(code: number) {
    return getWeatherInfo(code);
  }

  getDayName(dateStr: string): string {
    return new Date(dateStr)
      .toLocaleDateString('pt-BR', { weekday: 'short' })
      .replace('.', '')
      .toUpperCase();
  }

  get dateRange(): string {
    if (!this.data) return '';
    const fmt = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return `${d.getDate()} ${d.toLocaleDateString('en', { month: 'short' }).toUpperCase()}`;
    };
    return `${fmt(this.data.daily[0].date)} – ${fmt(this.data.daily[6].date)}`;
  }

  getDayClass(i: number): string {
    const palette = [
      'bg-tr-ink text-tr-cream',
      'bg-tr-sky-card dark:bg-tr-dark-sky',
      'bg-[#e1ead9] dark:bg-tr-dark-sky',
      'bg-[#f3d9cc] dark:bg-tr-dark-sand',
      'bg-tr-sand dark:bg-tr-dark-sand',
      'bg-[#f4ead9] dark:bg-tr-dark-sand',
      'bg-[#efe0ca] dark:bg-tr-dark-sand',
    ];
    return palette[i] ?? palette[6];
  }
}
