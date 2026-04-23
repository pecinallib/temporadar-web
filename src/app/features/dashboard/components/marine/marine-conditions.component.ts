import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarineData } from '../../../../core/models';

@Component({
  selector: 'app-marine-conditions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="data" class="flex flex-col gap-7">
      <!-- Hero card -->
      <div
        class="rounded-4xl bg-tr-paper dark:bg-tr-dark-card
                  border border-tr-ink/8 dark:border-tr-dark-ink/8
                  shadow-lg p-7"
      >
        <div class="flex justify-between items-start mb-6">
          <span
            class="text-[11px] tracking-widest uppercase
                       text-tr-ink-mute dark:text-tr-dark-mute font-medium"
          >
            Condições Atuais do Mar
          </span>
          <span class="text-2xl">🌊</span>
        </div>

        <!-- Altura da onda grande -->
        <div class="flex items-end gap-2 mb-6">
          <span
            class="font-playfair text-tr-ink dark:text-tr-dark-ink"
            style="font-size: 120px; line-height: 1;"
          >
            {{ data.current.waveHeight }}
          </span>
          <span
            class="font-playfair text-tr-terra mb-4"
            style="font-size: 40px; line-height: 1;"
          >
            m
          </span>
          <span
            class="text-tr-ink-soft dark:text-tr-dark-soft text-sm mb-6 ml-2"
          >
            altura das ondas
          </span>
        </div>

        <!-- Grid de métricas -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div
            class="flex items-center gap-3 px-4 py-3 rounded-full
                      bg-tr-sky-card dark:bg-tr-dark-sky"
          >
            <div
              class="w-9 h-9 rounded-full bg-white/55 dark:bg-white/8
                        grid place-items-center"
            >
              🕐
            </div>
            <div class="flex flex-col leading-tight">
              <small
                class="text-[10.5px] tracking-widest uppercase
                            text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >
                Período
              </small>
              <span
                class="font-playfair text-[22px] font-medium
                           text-tr-ink dark:text-tr-dark-ink"
              >
                {{ data.current.wavePeriod
                }}<i
                  class="font-inter text-xs
                  text-tr-ink-soft dark:text-tr-dark-soft font-normal ml-1"
                  >s</i
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
                        grid place-items-center"
            >
              🧭
            </div>
            <div class="flex flex-col leading-tight">
              <small
                class="text-[10.5px] tracking-widest uppercase
                            text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >
                Direção
              </small>
              <span
                class="font-playfair text-[22px] font-medium
                           text-tr-ink dark:text-tr-dark-ink"
              >
                {{ getDirection(data.current.waveDirection) }}
              </span>
            </div>
          </div>

          <div
            class="flex items-center gap-3 px-4 py-3 rounded-full
                      bg-[#e1ead9] dark:bg-tr-dark-sky"
          >
            <div
              class="w-9 h-9 rounded-full bg-white/55 dark:bg-white/8
                        grid place-items-center"
            >
              💨
            </div>
            <div class="flex flex-col leading-tight">
              <small
                class="text-[10.5px] tracking-widest uppercase
                            text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >
                Vento Mar
              </small>
              <span
                class="font-playfair text-[22px] font-medium
                           text-tr-ink dark:text-tr-dark-ink"
              >
                {{ data.current.windWaveHeight
                }}<i
                  class="font-inter text-xs
                  text-tr-ink-soft dark:text-tr-dark-soft font-normal ml-1"
                  >m</i
                >
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Swell card -->
      <div
        class="rounded-4xl bg-tr-paper dark:bg-tr-dark-card
                  border border-tr-ink/8 dark:border-tr-dark-ink/8
                  shadow-lg p-7"
      >
        <h2
          class="font-playfair text-[22px] font-medium
                   text-tr-ink dark:text-tr-dark-ink tracking-tight mb-5"
        >
          Ondulação (Swell)
        </h2>

        <div class="grid grid-cols-3 gap-3">
          <div
            class="bg-tr-sky-card dark:bg-tr-dark-sky
                      rounded-3xl p-5 flex flex-col gap-1"
          >
            <small
              class="text-[10.5px] tracking-widest uppercase
                          text-tr-ink-mute dark:text-tr-dark-mute font-medium"
            >
              Altura
            </small>
            <span
              class="font-playfair text-[36px] font-medium
                         text-tr-ink dark:text-tr-dark-ink leading-none mt-1"
            >
              {{ data.current.swellHeight }}
              <i class="font-inter text-sm text-tr-ink-soft font-normal">m</i>
            </span>
          </div>

          <div
            class="bg-tr-sand dark:bg-tr-dark-sand
                      rounded-3xl p-5 flex flex-col gap-1"
          >
            <small
              class="text-[10.5px] tracking-widest uppercase
                          text-tr-ink-mute dark:text-tr-dark-mute font-medium"
            >
              Período
            </small>
            <span
              class="font-playfair text-[36px] font-medium
                         text-tr-ink dark:text-tr-dark-ink leading-none mt-1"
            >
              {{ data.current.swellPeriod }}
              <i class="font-inter text-sm text-tr-ink-soft font-normal">s</i>
            </span>
          </div>

          <div
            class="bg-[#e1ead9] dark:bg-tr-dark-sky
                      rounded-3xl p-5 flex flex-col gap-1"
          >
            <small
              class="text-[10.5px] tracking-widest uppercase
                          text-tr-ink-mute dark:text-tr-dark-mute font-medium"
            >
              Direção
            </small>
            <span
              class="font-playfair text-[36px] font-medium
                         text-tr-ink dark:text-tr-dark-ink leading-none mt-1"
            >
              {{ getDirection(data.current.swellDirection) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MarineConditionsComponent {
  @Input() data: MarineData | null = null;

  getDirection(degrees: number): string {
    const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(degrees / 45) % 8];
  }
}
