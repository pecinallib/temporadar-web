import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../components/search-bar/search-bar.component';
import { WeatherMapComponent } from '../components/weather-map/weather-map.component';
import { CurrentConditionsComponent } from '../components/current-conditions/current-conditions.component';
import { HourlyChartComponent } from '../components/hourly-chart/hourly-chart.component';
import { AqiCardComponent } from '../components/aqi-card/aqi-card.component';
import { ForecastStripComponent } from '../components/forecast-strip/forecast-strip.component';
import {
  TabBarComponent,
  TabType,
} from '../components/tab-bar/tab-bar.component';
import { MarineConditionsComponent } from '../components/marine/marine-conditions.component';
import { MarineChartComponent } from '../components/marine/marine-chart.component';
import { HistoricalChartComponent } from '../components/historical/historical-chart.component';
import { MapFullComponent } from '../components/map-full/map-full.component';
import {
  WeatherService,
  LocationService,
  GeocodingService,
  ThemeService,
  MarineService,
  HistoricalService,
} from '../../../core/services';
import {
  WeatherData,
  Location,
  MarineData,
  HistoricalSummary,
} from '../../../core/models';
import { switchMap } from 'rxjs/operators';
import { BackgroundEffectComponent } from '../components/background-effect/background-effect.component';
import { AnimateOnEnterDirective } from '../../../shared/directives/animate-on-enter.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    WeatherMapComponent,
    CurrentConditionsComponent,
    HourlyChartComponent,
    AqiCardComponent,
    ForecastStripComponent,
    TabBarComponent,
    MarineConditionsComponent,
    MarineChartComponent,
    HistoricalChartComponent,
    MapFullComponent,
    BackgroundEffectComponent,
    AnimateOnEnterDirective,
  ],
  template: `
    <div
      class="min-h-screen transition-colors duration-300
   bg-gradient-to-b from-tr-peach/55 via-[#f9d9c4]/55 to-tr-cream/55
   dark:from-tr-dark-sand/55 dark:via-tr-dark-card/55 dark:to-tr-dark-bg/55"
    >
      <app-background-effect></app-background-effect>
      <div
        class="max-w-[1240px] mx-auto px-6 md:px-12 py-10 pb-16 relative z-10"
      >
        <!-- TOP ROW -->
        <div
          class="flex flex-col md:flex-row md:items-end
                    justify-between gap-6 pb-7"
        >
          <!-- Esquerda: brand + cidade -->
          <div>
            <div class="flex items-center gap-3 mb-3">
              <div class="flex items-center gap-2">
                <!-- Ícone radar -->
                <svg
                  class="w-7 h-7 flex-shrink-0"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="13"
                    class="stroke-tr-terra dark:stroke-tr-terra"
                    stroke-width="1.5"
                    stroke-opacity="0.3"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="8"
                    class="stroke-tr-terra dark:stroke-tr-terra"
                    stroke-width="1.5"
                    stroke-opacity="0.5"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="3"
                    class="fill-tr-terra dark:fill-tr-terra"
                  />
                  <line
                    x1="14"
                    y1="14"
                    x2="24"
                    y2="5"
                    class="stroke-tr-terra dark:stroke-tr-terra"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-opacity="0.8"
                  />
                </svg>

                <!-- Texto -->
                <span class="flex items-baseline gap-0 leading-none">
                  <span
                    class="font-playfair text-[26px] font-bold tracking-tight
               text-tr-ink dark:text-tr-dark-ink"
                    >Tempo</span
                  >
                  <span
                    class="font-playfair text-[26px] font-bold italic tracking-tight
               text-tr-terra"
                    >Radar</span
                  >
                </span>
              </div>
            </div>

            <h1
              class="font-playfair font-medium leading-none
                       tracking-tight text-tr-ink dark:text-tr-dark-ink
                       text-[56px] md:text-[72px]"
            >
              {{ weatherData?.location?.city }},
              <em class="italic font-normal text-tr-terra">
                {{ weatherData?.location?.country }}
              </em>
            </h1>

            <div
              class="flex items-center gap-4 mt-2 text-sm
                        text-tr-ink-soft dark:text-tr-dark-soft"
            >
              <span>{{ today }}</span>
              <span class="w-1 h-1 rounded-full bg-tr-ink-mute"></span>
              <span
                >Horário local
                <b class="text-tr-ink dark:text-tr-dark-ink font-medium">{{
                  time
                }}</b></span
              >
              <span class="w-1 h-1 rounded-full bg-tr-ink-mute"></span>
              <span>{{ currentConditionLabel }}</span>
            </div>
          </div>

          <!-- Direita: search + controles -->
          <div class="flex flex-col items-stretch md:items-end gap-3">
            <app-search-bar
              (locationSelected)="onLocationSelected($event)"
              (useMyLocation)="loadByLocation()"
            >
            </app-search-bar>

            <div class="flex items-center justify-between md:justify-end gap-3">
              <!-- °C / °F toggle -->
              <div
                class="flex gap-0.5 bg-tr-paper dark:bg-tr-dark-card
                          p-1 rounded-full border border-tr-ink/8
                          dark:border-tr-dark-ink/8"
              >
                <button
                  (click)="unit = 'C'"
                  [class]="
                    unit === 'C'
                      ? 'bg-tr-ink dark:bg-tr-terra text-tr-cream px-4 py-1.5 rounded-full text-xs font-medium'
                      : 'text-tr-ink-mute dark:text-tr-dark-mute px-4 py-1.5 rounded-full text-xs font-medium'
                  "
                >
                  °C
                </button>
                <button
                  (click)="unit = 'F'"
                  [class]="
                    unit === 'F'
                      ? 'bg-tr-ink dark:bg-tr-terra text-tr-cream px-4 py-1.5 rounded-full text-xs font-medium'
                      : 'text-tr-ink-mute dark:text-tr-dark-mute px-4 py-1.5 rounded-full text-xs font-medium'
                  "
                >
                  °F
                </button>
              </div>

              <!-- Dark mode toggle -->
              <button
                (click)="theme.toggle()"
                class="relative flex items-center w-[74px] h-8
                             bg-tr-paper dark:bg-tr-dark-card
                             border border-tr-ink/8 dark:border-tr-dark-ink/8
                             rounded-full cursor-pointer transition-all duration-300"
              >
                <div
                  class="absolute top-[3px] w-6 h-6 rounded-full
                            grid place-items-center text-xs shadow-md
                            transition-all duration-300"
                  [class]="
                    theme.isDark()
                      ? 'translate-x-[43px] bg-tr-sage text-tr-dark-bg'
                      : 'translate-x-[3px] bg-tr-sun text-tr-paper'
                  "
                >
                  {{ theme.isDark() ? '🌙' : '☀️' }}
                </div>
                <div
                  class="w-full flex justify-between px-2.5
                            text-[9.5px] tracking-widest uppercase
                            text-tr-ink-mute dark:text-tr-dark-mute font-medium"
                  [class]="theme.isDark() ? 'pl-3 pr-8' : 'pl-8 pr-3'"
                >
                  <span
                    [class]="
                      theme.isDark()
                        ? 'text-tr-ink-mute dark:text-tr-dark-mute'
                        : 'text-tr-ink dark:text-tr-dark-ink'
                    "
                  >
                    {{ theme.isDark() ? 'Dark' : 'Light' }}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div
          *ngIf="loading"
          class="flex items-center justify-center py-32
                    text-tr-ink-soft dark:text-tr-dark-soft"
        >
          <div class="flex flex-col items-center gap-4">
            <div
              class="w-10 h-10 rounded-full border-2
                        border-tr-terra border-t-transparent animate-spin"
            ></div>
            <span class="font-inter text-sm tracking-wide">
              Carregando dados do clima...
            </span>
          </div>
        </div>

        <!-- Conteúdo principal -->
        <div *ngIf="!loading && weatherData">
          <!-- Tab bar -->
          <div class="mb-7">
            <app-tab-bar
              [activeTab]="activeTab"
              (tabChanged)="onTabChanged($event)"
            ></app-tab-bar>
          </div>

          <!-- ABA: Clima -->
          <div [hidden]="activeTab !== 'clima'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-7">
              <app-weather-map
                [animateOnEnter]="animateTrigger"
                [data]="weatherData"
              ></app-weather-map>
              <app-current-conditions
                [animateOnEnter]="animateTrigger"
                [data]="weatherData"
                [unit]="unit"
              ></app-current-conditions>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-7 mt-7">
              <app-hourly-chart
                [animateOnEnter]="animateTrigger"
                [data]="weatherData"
              ></app-hourly-chart>
              <app-aqi-card
                [animateOnEnter]="animateTrigger"
                [data]="weatherData"
              ></app-aqi-card>
            </div>
            <app-forecast-strip
              [animateOnEnter]="animateTrigger"
              [data]="weatherData"
              [unit]="unit"
            ></app-forecast-strip>
          </div>

          <!-- ABA: Marine -->
          <div [hidden]="activeTab !== 'marine'">
            <div
              *ngIf="loadingMarine"
              class="flex items-center justify-center py-32
                text-tr-ink-soft dark:text-tr-dark-soft"
            >
              <div class="flex flex-col items-center gap-4">
                <div
                  class="w-10 h-10 rounded-full border-2
                    border-tr-sky border-t-transparent animate-spin"
                ></div>
                <span class="font-inter text-sm"
                  >Carregando dados do mar...</span
                >
              </div>
            </div>
            <div
              *ngIf="!loadingMarine && marineData"
              class="flex flex-col gap-7"
            >
              <app-marine-conditions
                [animateOnEnter]="animateTrigger"
                [data]="marineData"
              ></app-marine-conditions>
              <app-marine-chart
                [animateOnEnter]="animateTrigger"
                [data]="marineData"
              ></app-marine-chart>
            </div>
          </div>

          <!-- ABA: Histórico -->
          <div [hidden]="activeTab !== 'historico'">
            <div
              *ngIf="loadingHistorical"
              class="flex items-center justify-center py-32
                text-tr-ink-soft dark:text-tr-dark-soft"
            >
              <div class="flex flex-col items-center gap-4">
                <div
                  class="w-10 h-10 rounded-full border-2
                    border-tr-sage border-t-transparent animate-spin"
                ></div>
                <span class="font-inter text-sm">Carregando histórico...</span>
              </div>
            </div>
            <div *ngIf="!loadingHistorical && historicalData">
              <app-historical-chart
                [animateOnEnter]="animateTrigger"
                [data]="historicalData"
                [lat]="weatherData ? weatherData.location.lat : 0"
                [lon]="weatherData ? weatherData.location.lon : 0"
              ></app-historical-chart>
            </div>
          </div>

          <!-- ABA: Mapa -->
          <div [hidden]="activeTab !== 'mapa'">
            <app-map-full
              [animateOnEnter]="animateTrigger"
              [data]="weatherData"
            ></app-map-full>
          </div>

          <!-- Footer -->
          <div
            class="flex flex-col md:flex-row items-center justify-between
         mt-10 pt-6 border-t border-tr-ink/6 dark:border-tr-dark-ink/6
         gap-4 px-2"
          >
            <!-- Esquerda: créditos -->
            <span
              class="text-[11px] text-tr-ink-mute dark:text-tr-dark-mute font-inter"
            >
              TempoRadar v1.0 · Open-Meteo + Nominatim
            </span>

            <!-- Centro: links -->
            <div class="flex items-center gap-5">
              <a
                href="https://github.com/pecinallib"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-1.5 text-[11px] font-inter
             text-tr-ink-soft dark:text-tr-dark-soft
             hover:text-tr-terra dark:hover:text-tr-terra
             transition-colors duration-200"
              >
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                GitHub
              </a>

              <a
                href="https://pecinalli-dev.vercel.app"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-1.5 text-[11px] font-inter
             text-tr-ink-soft dark:text-tr-dark-soft
             hover:text-tr-terra dark:hover:text-tr-terra
             transition-colors duration-200"
              >
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-1 17.93V18a1 1 0 0 0-1-1H8a3 3 0 0 1-3-3v-1l5 5v.93zM17.9 15.39A3 3 0 0 0 15 13h-1v-2a1 1 0 0 0-1-1H8V8h2a1 1 0 0 0 1-1V5.07A8.001 8.001 0 0 1 17.9 15.4z"
                  />
                </svg>
                Portfolio
              </a>

              <a
                href="https://linkedin.com/in/dev-pecinalli"
                target="_blank"
                rel="noopener"
                class="flex items-center gap-1.5 text-[11px] font-inter
             text-tr-ink-soft dark:text-tr-dark-soft
             hover:text-tr-terra dark:hover:text-tr-terra
             transition-colors duration-200"
              >
                <svg
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
                LinkedIn
              </a>
            </div>

            <!-- Direita: alterar localização -->
            <span
              (click)="loadByLocation()"
              class="text-[11px] text-tr-terra cursor-pointer
           hover:opacity-70 transition-opacity font-inter"
            >
              alterar localização
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  weatherData: WeatherData | null = null;
  marineData: MarineData | null = null;
  historicalData: HistoricalSummary | null = null;

  animateTrigger = 0;

  loading = true;
  loadingMarine = false;
  loadingHistorical = false;

  activeTab: TabType =
    (localStorage.getItem('tr-active-tab') as TabType) || 'clima';
  unit: 'C' | 'F' = 'C';
  time = '';
  today = '';
  @ViewChild(WeatherMapComponent) weatherMap!: WeatherMapComponent;
  @ViewChild(MapFullComponent) mapFull!: MapFullComponent;
  constructor(
    private weather: WeatherService,
    private location: LocationService,
    private geocoding: GeocodingService,
    private marine: MarineService,
    private historical: HistoricalService,
    public theme: ThemeService,
  ) {}

  convertTemp(celsius: number): number {
    if (this.unit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  }

  get unitSymbol(): string {
    return this.unit === 'F' ? '°F' : '°C';
  }

  ngOnInit(): void {
    this.updateClock();
    setInterval(() => this.updateClock(), 60000);
    this.loadByLocation();
  }

  loadByLocation(): void {
    this.loading = true;
    this.marineData = null;
    this.historicalData = null;

    this.location
      .getLocation()
      .pipe(
        switchMap((coords) =>
          this.geocoding
            .reverse(coords.lat, coords.lon)
            .pipe(
              switchMap((loc) =>
                this.weather.getWeatherData(loc.lat, loc.lon, loc),
              ),
            ),
        ),
      )
      .subscribe({
        next: (data) => {
          this.weatherData = data;
          this.loading = false;
          if (this.activeTab !== 'clima') {
            this.onTabChanged(this.activeTab);
          }
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onLocationSelected(loc: Location): void {
    this.loading = true;
    this.marineData = null;
    this.historicalData = null;

    this.weather.getWeatherData(loc.lat, loc.lon, loc).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onTabChanged(tab: TabType): void {
    this.animateTrigger++;
    this.activeTab = tab;
    localStorage.setItem('tr-active-tab', tab);

    setTimeout(() => {
      if (tab === 'clima' && this.weatherMap) {
        this.weatherMap.refreshSize();
      }
      if (tab === 'mapa' && this.mapFull) {
        this.mapFull.refreshSize();
      }
    }, 50);

    if (tab === 'marine' && !this.marineData && this.weatherData) {
      this.loadingMarine = true;
      this.marine
        .getMarineData(
          this.weatherData.location.lat,
          this.weatherData.location.lon,
        )
        .subscribe({
          next: (data) => {
            this.marineData = data;
            this.loadingMarine = false;
          },
          error: () => {
            this.loadingMarine = false;
          },
        });
    }

    if (tab === 'historico' && !this.historicalData && this.weatherData) {
      this.loadingHistorical = true;
      this.historical
        .getHistoricalSummary(
          this.weatherData.location.lat,
          this.weatherData.location.lon,
        )
        .subscribe({
          next: (data) => {
            this.historicalData = data;
            this.loadingHistorical = false;
          },
          error: () => {
            this.loadingHistorical = false;
          },
        });
    }
  }

  get currentConditionLabel(): string {
    if (!this.weatherData) return '';
    const code = this.weatherData.current.weatherCode;
    const labels: Record<number, string> = {
      0: 'Céu limpo',
      1: 'Majoritariamente limpo',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Neblina',
      61: 'Chuva fraca',
      63: 'Chuva',
      80: 'Pancadas de chuva',
      95: 'Trovoada',
    };
    return labels[code] ?? 'Majoritariamente ensolarado';
  }

  private updateClock(): void {
    const now = new Date();
    this.time = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    this.today = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
