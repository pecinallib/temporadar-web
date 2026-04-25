import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { WeatherData } from '../../../../core/models';
import { environment } from '../../../../../environments/environment';

type MapLayer = 'temperatura' | 'chuva' | 'vento' | 'nuvens';

@Component({
  selector: 'app-map-full',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Seletor de camadas -->
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="font-inter text-[11px] tracking-widest uppercase
                     text-tr-ink-mute dark:text-tr-dark-mute font-medium mr-2"
        >
          Camada:
        </span>
        <button
          *ngFor="let layer of layers"
          (click)="selectLayer(layer.id)"
          [class]="getLayerClass(layer.id)"
        >
          {{ layer.icon }} {{ layer.label }}
        </button>
      </div>

      <!-- Mapa -->
      <div
        class="relative rounded-4xl overflow-hidden shadow-lg"
        style="height: 520px;"
      >
        <div #mapContainer class="absolute inset-0 z-0"></div>

        <!-- Tag live -->
        <div
          class="absolute top-5 left-5 z-10
                    flex items-center gap-2 px-3 py-2 rounded-full
                    bg-tr-paper/80 dark:bg-tr-dark-card/80
                    backdrop-blur-sm border border-tr-ink/5
                    text-[11px] tracking-widest uppercase
                    text-tr-ink-soft dark:text-tr-dark-soft"
        >
          <span
            class="w-1.5 h-1.5 rounded-full bg-tr-terra
                       shadow-[0_0_0_4px_rgba(193,105,79,0.18)]"
          ></span>
          {{ activeLayerLabel }}
        </div>

        <!-- Controles zoom -->
        <div class="absolute top-5 right-5 z-10 flex flex-col gap-1.5">
          <button
            (click)="zoomIn()"
            class="w-9 h-9 rounded-xl border border-tr-ink/8
                         bg-tr-paper/90 dark:bg-tr-dark-card/90
                         text-tr-ink dark:text-tr-dark-ink
                         grid place-items-center shadow-md
                         hover:-translate-y-px transition-transform font-medium"
          >
            +
          </button>
          <button
            (click)="zoomOut()"
            class="w-9 h-9 rounded-xl border border-tr-ink/8
                         bg-tr-paper/90 dark:bg-tr-dark-card/90
                         text-tr-ink dark:text-tr-dark-ink
                         grid place-items-center shadow-md
                         hover:-translate-y-px transition-transform font-medium"
          >
            −
          </button>
        </div>
      </div>
    </div>
  `,
})
export class MapFullComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: WeatherData | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private map!: L.Map;
  private baseLayer!: L.TileLayer;
  private weatherLayer!: L.TileLayer;
  private marker!: L.Marker;

  activeLayer: MapLayer = 'temperatura';

  layers = [
    { id: 'temperatura' as MapLayer, label: 'Temperatura', icon: '🌡️' },
    { id: 'chuva' as MapLayer, label: 'Chuva', icon: '🌧️' },
    { id: 'vento' as MapLayer, label: 'Vento', icon: '💨' },
    { id: 'nuvens' as MapLayer, label: 'Nuvens', icon: '☁️' },
  ];

  get activeLayerLabel(): string {
    return this.layers.find((l) => l.id === this.activeLayer)?.label ?? '';
  }

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
      this.updateMarker();
    }
  }

  public refreshSize(): void {
    if (this.map) {
      this.map.invalidateSize(true);
      this.map.setView(this.map.getCenter(), this.map.getZoom());
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      maxZoom: 14,
    }).setView([-22.8791, -42.0232], 6);

    this.baseLayer = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
      { maxZoom: 14 },
    ).addTo(this.map);

    this.addWeatherLayer();
    if (this.data) this.updateMarker();
  }

  private addWeatherLayer(): void {
    if (this.weatherLayer) this.map.removeLayer(this.weatherLayer);

    const layerMap: Record<MapLayer, string> = {
      temperatura: 'temp_new',
      chuva: 'precipitation_new',
      vento: 'wind_new',
      nuvens: 'clouds_new',
    };

    const layer = layerMap[this.activeLayer];
    const apiKey = environment.owmApiKey;

    this.weatherLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`,
      { opacity: 0.6, maxZoom: 18 },
    ).addTo(this.map);
  }

  private updateMarker(): void {
    if (!this.data) return;
    const { lat, lon } = this.data.location;

    this.map.setView([lat, lon], 8);

    if (this.marker) this.marker.remove();

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        background: #c1694f; width: 14px; height: 14px;
        border-radius: 50%; border: 3px solid white;
        box-shadow: 0 4px 12px rgba(193,105,79,0.5),
                    0 0 0 6px rgba(193,105,79,0.15);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    this.marker = L.marker([lat, lon], { icon })
      .addTo(this.map)
      .bindPopup(
        `
        <div style="font-family: Inter, sans-serif;">
          <div style="font-size:11px; text-transform:uppercase;
                      letter-spacing:.14em; color:#9a8a74; margin-bottom:4px;">
            ${this.data.location.city}
          </div>
          <div style="font-family:'Playfair Display',serif;
                      font-size:28px; color:#2d2418;">
            ${this.data.current.temperature}°
          </div>
        </div>
      `,
        { closeButton: false },
      );
  }

  selectLayer(layer: MapLayer): void {
    this.activeLayer = layer;
    this.addWeatherLayer();
  }

  getLayerClass(layer: MapLayer): string {
    const base =
      'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 font-inter';
    return layer === this.activeLayer
      ? `${base} bg-tr-ink dark:bg-tr-terra text-tr-cream shadow-sm`
      : `${base} bg-tr-paper dark:bg-tr-dark-card text-tr-ink-soft dark:text-tr-dark-soft border border-tr-ink/8 dark:border-tr-dark-ink/8 hover:bg-tr-sand dark:hover:bg-tr-dark-sand`;
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }
  zoomOut(): void {
    this.map?.zoomOut();
  }
}
