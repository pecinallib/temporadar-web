import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../../../core/models';
import { getWeatherInfo } from '../../../../core/services';

@Component({
  selector: 'app-current-conditions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="data"
      class="rounded-4xl bg-tr-paper dark:bg-tr-dark-card
                border border-tr-ink/8 dark:border-tr-dark-ink/8
                shadow-lg p-7 flex flex-col gap-5"
    >
      <div class="flex justify-between items-start">
        <span
          class="text-[11px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium"
        >
          Temperatura Atual · {{ unit === 'F' ? '°F' : '°C' }}
        </span>
        <div
          class="flex items-center gap-2 text-sm
                    text-tr-ink-soft dark:text-tr-dark-soft"
        >
          <div
            class="w-6 h-6 rounded-full
                      bg-gradient-to-br from-[#fde2c2] to-tr-sun
                      shadow-[0_0_0_5px_rgba(242,166,90,0.18)]"
          ></div>
          {{ weatherInfo.label }}
        </div>
      </div>

      <div class="leading-none -mt-6 mb-6 flex items-start">
        <span
          class="font-playfair text-tr-ink dark:text-tr-dark-ink tracking-tight"
          style="font-size: 130px; line-height: 1;"
        >
          {{ convert(data.current.temperature) }}
        </span>
        <span
          class="font-playfair text-tr-terra mt-4"
          style="font-size: 48px; line-height: 1;"
        >
          °
        </span>
      </div>

      <div
        class="flex items-center gap-4 text-sm -mt-4
                  text-tr-ink-soft dark:text-tr-dark-soft"
      >
        <span>
          Sensação
          <b class="text-tr-ink dark:text-tr-dark-ink font-medium">
            {{ convert(data.current.feelsLike) }}°
          </b>
        </span>
        <span class="flex gap-3">
          <span
            >H
            <b class="text-tr-ink dark:text-tr-dark-ink font-medium">
              {{ convert(data.daily[0].tempMax) }}°
            </b></span
          >
          <span
            >L
            <b class="text-tr-ink dark:text-tr-dark-ink font-medium">
              {{ convert(data.daily[0].tempMin) }}°
            </b></span
          >
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-full
                    bg-tr-sky-card dark:bg-tr-dark-sky"
        >
          <div
            class="w-9 h-9 rounded-full bg-white/55 dark:bg-white/8
                      grid place-items-center text-tr-ink-soft dark:text-tr-dark-soft"
          >
            💧
          </div>
          <div class="flex flex-col leading-tight">
            <small
              class="text-[10.5px] tracking-widest uppercase
                          text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >UMIDADE</small
            >
            <span
              class="font-playfair text-[22px] font-medium text-tr-ink dark:text-tr-dark-ink"
            >
              {{ data.current.humidity
              }}<i
                class="font-inter text-xs
                text-tr-ink-soft dark:text-tr-dark-soft font-normal ml-1"
                >%</i
              >
            </span>
          </div>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-3 rounded-full
                    bg-tr-sand dark:bg-tr-dark-sand"
        >
          <div
            class="w-9 h-9 rounded-full bg-white/55 dark:bg-white/8
                      grid place-items-center text-tr-ink-soft dark:text-tr-dark-soft"
          >
            💨
          </div>
          <div class="flex flex-col leading-tight">
            <small
              class="text-[10.5px] tracking-widest uppercase
                          text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >VENTO</small
            >
            <span
              class="font-playfair text-[22px] font-medium text-tr-ink dark:text-tr-dark-ink"
            >
              {{ data.current.windSpeed
              }}<i
                class="font-inter text-xs
                text-tr-ink-soft dark:text-tr-dark-soft font-normal ml-1"
                >km/h</i
              >
            </span>
          </div>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-3 rounded-full
                    bg-[#e1ead9] dark:bg-tr-dark-sky"
        >
          <div
            class="w-9 h-9 rounded-full bg-white/55 dark:bg-white/8
                      grid place-items-center text-tr-ink-soft dark:text-tr-dark-soft"
          >
            ☀️
          </div>
          <div class="flex flex-col leading-tight">
            <small
              class="text-[10.5px] tracking-widest uppercase
                          text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >ÍNDICE UV</small
            >
            <span
              class="font-playfair text-[22px] font-medium text-tr-ink dark:text-tr-dark-ink"
            >
              {{ data.current.uvIndex }}
            </span>
          </div>
        </div>

        <div
          class="flex items-center gap-3 px-4 py-3 rounded-full
                    bg-[#f3d9cc] dark:bg-tr-dark-sand"
        >
          <div
            class="w-9 h-9 rounded-full bg-white/55 dark:bg-white/8
                      grid place-items-center text-tr-ink-soft dark:text-tr-dark-soft"
          >
            👁️
          </div>
          <div class="flex flex-col leading-tight">
            <small
              class="text-[10.5px] tracking-widest uppercase
                          text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >VISIBILIDADE</small
            >
            <span
              class="font-playfair text-[22px] font-medium text-tr-ink dark:text-tr-dark-ink"
            >
              {{ data.current.visibility
              }}<i
                class="font-inter text-xs
                text-tr-ink-soft dark:text-tr-dark-soft font-normal ml-1"
                >km</i
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CurrentConditionsComponent {
  @Input() data: WeatherData | null = null;
  @Input() unit: 'C' | 'F' = 'C';

  get weatherInfo() {
    return this.data
      ? getWeatherInfo(this.data.current.weatherCode)
      : { label: '', icon: '' };
  }

  convert(celsius: number): number {
    if (this.unit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  }
}
