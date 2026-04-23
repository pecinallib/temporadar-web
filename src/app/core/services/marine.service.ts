import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MarineData } from '../models';

@Injectable({ providedIn: 'root' })
export class MarineService {
  private baseUrl = 'https://marine-api.open-meteo.com/v1/marine';

  constructor(private http: HttpClient) {}

  getMarineData(lat: number, lon: number): Observable<MarineData> {
    return this.http
      .get<any>(this.baseUrl, {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            'wave_height',
            'wave_period',
            'wave_direction',
            'swell_wave_height',
            'swell_wave_period',
            'swell_wave_direction',
            'wind_wave_height',
          ].join(','),
          hourly: [
            'wave_height',
            'wave_period',
            'wave_direction',
            'swell_wave_height',
          ].join(','),
          timezone: 'auto',
          forecast_days: '3',
        },
      })
      .pipe(map((r) => this.mapToMarineData(r)));
  }

  private mapToMarineData(r: any): MarineData {
    const c = r.current;
    const nowHour = new Date().getHours();

    return {
      current: {
        waveHeight: Math.round(c.wave_height * 10) / 10,
        wavePeriod: Math.round(c.wave_period),
        waveDirection: Math.round(c.wave_direction),
        swellHeight: Math.round(c.swell_wave_height * 10) / 10,
        swellPeriod: Math.round(c.swell_wave_period),
        swellDirection: Math.round(c.swell_wave_direction),
        windWaveHeight: Math.round(c.wind_wave_height * 10) / 10,
      },
      hourly: r.hourly.time
        .slice(nowHour, nowHour + 24)
        .map((time: string, i: number) => ({
          time,
          waveHeight: Math.round(r.hourly.wave_height[nowHour + i] * 10) / 10,
          wavePeriod: Math.round(r.hourly.wave_period[nowHour + i]),
          waveDirection: Math.round(r.hourly.wave_direction[nowHour + i]),
          swellHeight:
            Math.round(r.hourly.swell_wave_height[nowHour + i] * 10) / 10,
        })),
    };
  }
}
