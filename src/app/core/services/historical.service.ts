import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HistoricalData, HistoricalSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class HistoricalService {
  private baseUrl = 'https://archive-api.open-meteo.com/v1/archive';

  constructor(private http: HttpClient) {}

  getHistoricalSummary(
    lat: number,
    lon: number,
  ): Observable<HistoricalSummary> {
    const currentYear = new Date().getFullYear();
    const years = [
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
    ];

    const requests = years.map((year) => this.fetchYear(lat, lon, year));

    return forkJoin(requests).pipe(
      map(([cy, ...prev]) => ({
        currentYear: cy,
        previousYears: prev,
      })),
    );
  }

  private fetchYear(
    lat: number,
    lon: number,
    year: number,
  ): Observable<HistoricalData> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endYear =
      year === new Date().getFullYear() ? new Date().getFullYear() : year;
    const endDay = year === new Date().getFullYear() ? now.getDate() : lastDay;
    const endDate = `${endYear}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    return this.http
      .get<any>(this.baseUrl, {
        params: {
          latitude: lat,
          longitude: lon,
          start_date: startDate,
          end_date: endDate,
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'temperature_2m_mean',
            'precipitation_sum',
          ].join(','),
          timezone: 'auto',
        },
      })
      .pipe(
        map((r) => ({
          year,
          months: r.daily.time.map((date: string, i: number) => ({
            date,
            tempMax: Math.round(r.daily.temperature_2m_max[i]),
            tempMin: Math.round(r.daily.temperature_2m_min[i]),
            tempMean: Math.round(r.daily.temperature_2m_mean[i]),
            precipitation: Math.round(r.daily.precipitation_sum[i] * 10) / 10,
          })),
        })),
      );
  }
}
