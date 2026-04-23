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
              <div
                class="w-5 h-5 rounded-full
                          bg-gradient-to-br from-[#fde2c2] to-tr-terra
                          shadow-[0_0_0_4px_rgba(193,105,79,0.18)]"
              ></div>
              <span
                class="font-inter text-[11px] tracking-widest uppercase
                           text-tr-ink-soft dark:text-tr-dark-soft font-medium"
              >
                TempoRadar — Edição Matinal
              </span>
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
            class="flex justify-between items-center mt-8 px-2
              text-xs text-tr-ink-mute dark:text-tr-dark-mute"
          >
            <span>TempoRadar v1.0 · Open-Meteo + Nominatim</span>

            <span
              (click)="loadByLocation()"
              class="text-tr-terra cursor-pointer hover:opacity-70 transition-opacity"
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
