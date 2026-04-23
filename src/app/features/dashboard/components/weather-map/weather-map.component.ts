import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { WeatherData } from '../../../../core/models';
import { getWeatherInfo } from '../../../../core/services';

@Component({
  selector: 'app-weather-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative rounded-4xl overflow-hidden
                bg-tr-sky-card dark:bg-tr-dark-sky
                min-h-[440px] md:min-h-[480px] shadow-lg"
    >
      <!-- Mapa Leaflet -->
      <div #mapContainer class="absolute inset-0 z-0"></div>

      <!-- Chrome superior -->
      <div
        class="absolute top-5 left-5 right-5 z-10
                  flex justify-between items-start pointer-events-none"
      >
        <!-- Tag live -->
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-full
                    bg-tr-paper/80 dark:bg-tr-dark-card/80
                    backdrop-blur-sm border border-tr-ink/5
                    text-[11px] tracking-widest uppercase
                    text-tr-ink-soft dark:text-tr-dark-soft
                    pointer-events-auto"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-tr-terra
                       shadow-[0_0_0_4px_rgba(193,105,79,0.18)]"
          ></span>
          Live · {{ data?.location?.city }}
        </div>

        <!-- Controles zoom -->
        <div class="flex flex-col gap-1.5 pointer-events-auto">
          <button
            (click)="zoomIn()"
            class="w-9 h-9 rounded-xl border border-tr-ink/8
                         bg-tr-paper/90 dark:bg-tr-dark-card/90
                         text-tr-ink dark:text-tr-dark-ink
                         grid place-items-center shadow-md
                         hover:-translate-y-px transition-transform
                         font-medium text-base"
          >
            +
          </button>
          <button
            (click)="zoomOut()"
            class="w-9 h-9 rounded-xl border border-tr-ink/8
                         bg-tr-paper/90 dark:bg-tr-dark-card/90
                         text-tr-ink dark:text-tr-dark-ink
                         grid place-items-center shadow-md
                         hover:-translate-y-px transition-transform
                         font-medium text-base"
          >
            −
          </button>
        </div>
      </div>

      <!-- Coordenadas -->
      <div
        *ngIf="data"
        class="absolute bottom-5 right-5 z-10
                  text-[10.5px] tracking-widest uppercase
                  text-tr-ink-soft dark:text-tr-dark-soft
                  bg-tr-paper/80 dark:bg-tr-dark-card/80
                  backdrop-blur-sm px-3 py-1.5 rounded-full
                  border border-tr-ink/5 font-inter tabular-nums"
      >
        {{ data.location.lat | number: '1.2-2' }}°
        {{ data.location.lon | number: '1.2-2' }}°
      </div>
    </div>
  `,
})
export class WeatherMapComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() data: WeatherData | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map!: L.Map;
  private marker!: L.Marker;

  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      setTimeout(() => {
        this.map.invalidateSize(true);
      }, 400);
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data && this.map) {
      this.updateMap();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    }).setView([-22.8791, -42.0232], 10);

    L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
      {
        maxZoom: 18,
      },
    ).addTo(this.map);

    if (this.data) this.updateMap();
  }

  private updateMap(): void {
    if (!this.data) return;
    const { lat, lon } = this.data.location;
    const info = getWeatherInfo(this.data.current.weatherCode);

    this.map.setView([lat, lon], 10);

    if (this.marker) this.marker.remove();

    const icon = L.divIcon({
      className: '',
      html: `
        <div style="
          background: #c1694f;
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(193,105,79,0.5),
                      0 0 0 6px rgba(193,105,79,0.15);
        "></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    this.marker = L.marker([lat, lon], { icon })
      .addTo(this.map)
      .bindPopup(
        `
        <div style="font-family: Inter, sans-serif; min-width: 140px;">
          <div style="font-size:11px; text-transform:uppercase;
                      letter-spacing:.14em; color:#9a8a74; margin-bottom:6px;">
            ${this.data.location.city}
          </div>
          <div style="font-family:'Playfair Display',serif;
                      font-size:32px; line-height:1; color:#2d2418;">
            ${this.data.current.temperature}°
          </div>
          <div style="font-size:12px; color:#6b5b49; margin-top:4px;">
            ${info.icon} ${info.label}
          </div>
        </div>
      `,
        { closeButton: false },
      );
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }
  zoomOut(): void {
    this.map?.zoomOut();
  }
}
