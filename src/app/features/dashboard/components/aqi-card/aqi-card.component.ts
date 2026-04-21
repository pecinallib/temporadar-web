import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../../../core/models';

@Component({
  selector: 'app-aqi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="data"
      class="rounded-4xl bg-tr-paper dark:bg-tr-dark-card
                border border-tr-ink/8 dark:border-tr-dark-ink/8
                shadow-lg p-7 flex flex-col gap-5"
    >
      <!-- Header -->
      <h2
        class="font-playfair text-[22px] font-medium
                 text-tr-ink dark:text-tr-dark-ink tracking-tight
                 flex justify-between items-baseline"
      >
        Air quality
        <span
          class="font-inter text-[11px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium"
        >
          {{ data.location.city }} station
        </span>
      </h2>

      <!-- AQI + status -->
      <div class="flex justify-between items-end">
        <div>
          <small
            class="text-[11px] tracking-widest uppercase
                        text-tr-ink-mute dark:text-tr-dark-mute font-medium block mb-2"
          >
            AQI · EU
          </small>
          <span
            class="font-playfair text-[72px] leading-none
                       text-tr-ink dark:text-tr-dark-ink font-medium tracking-tight"
          >
            {{ data.airQuality.aqi }}
          </span>
        </div>
        <div
          class="text-right text-sm text-tr-ink-soft dark:text-tr-dark-soft
                    leading-relaxed max-w-[54%]"
        >
          <b
            class="block font-playfair text-xl italic font-medium mb-1"
            [style.color]="data.airQuality.color"
          >
            {{ data.airQuality.category }} — fresh air
          </b>
          Breathe easy. Ideal conditions for outdoor activities.
        </div>
      </div>

      <!-- Barra AQI -->
      <div
        class="relative h-3.5 rounded-full overflow-hidden"
        style="background: linear-gradient(90deg, #9ec48a 0%, #c4d07a 30%, #e6c066 55%, #d98a5c 78%, #b85454 100%)"
      >
        <div
          class="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                    bg-tr-paper dark:bg-tr-dark-card
                    border-2 border-tr-ink dark:border-tr-dark-ink
                    shadow-md -translate-x-1/2"
          [style.left]="aqiPercent + '%'"
        ></div>
      </div>
      <div
        class="flex justify-between text-[10.5px] tracking-widest
                  uppercase text-tr-ink-mute dark:text-tr-dark-mute font-medium -mt-3"
      >
        <span>Good</span>
        <span>Moderate</span>
        <span>Unhealthy</span>
        <span>Hazardous</span>
      </div>

      <!-- Breakdown -->
      <div class="grid grid-cols-4 gap-2.5">
        <div
          *ngFor="let item of breakdown"
          class="bg-[#f4ead9] dark:bg-tr-dark-sand
                    rounded-[18px] p-3"
        >
          <small
            class="text-[10px] tracking-widest uppercase
                        text-tr-ink-mute dark:text-tr-dark-mute font-medium"
          >
            {{ item.label }}
          </small>
          <b
            class="block font-playfair text-lg font-medium mt-1
                    text-tr-ink dark:text-tr-dark-ink"
          >
            {{ item.value }}
            <em
              class="font-inter text-[10px] text-tr-ink-mute
                       dark:text-tr-dark-mute font-normal not-italic ml-0.5"
            >
              {{ item.unit }}
            </em>
          </b>
        </div>
      </div>
    </div>
  `,
})
export class AqiCardComponent {
  @Input() data: WeatherData | null = null;

  get aqiPercent(): number {
    return Math.min((this.data!.airQuality.aqi / 100) * 100, 95);
  }

  get breakdown() {
    if (!this.data) return [];
    const { pm25, pm10, ozone } = this.data.airQuality;
    return [
      { label: 'PM 2.5', value: pm25.toFixed(1), unit: 'μg/m³' },
      { label: 'PM 10', value: pm10.toFixed(1), unit: 'μg/m³' },
      { label: 'Ozone', value: ozone.toFixed(0), unit: 'ppb' },
      { label: 'Pollen', value: 'Low', unit: '' },
    ];
  }
}
