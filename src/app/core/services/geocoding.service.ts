import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Location } from '../models';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) {}

  search(query: string): Observable<Location[]> {
    const url = `${this.nominatimUrl}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    return this.http
      .get<any[]>(url, {
        headers: { 'Accept-Language': 'pt-BR,en' },
      })
      .pipe(
        map((results) =>
          results.map((r) => ({
            city:
              r.address?.city ||
              r.address?.town ||
              r.address?.village ||
              r.name,
            country: r.address?.country_code?.toUpperCase() || '',
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
          })),
        ),
      );
  }

  reverse(lat: number, lon: number): Observable<Location> {
    const url = `${this.nominatimUrl}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    return this.http
      .get<any>(url, {
        headers: { 'Accept-Language': 'pt-BR,en' },
      })
      .pipe(
        map((r) => ({
          city:
            r.address?.city || r.address?.town || r.address?.village || r.name,
          country: r.address?.country_code?.toUpperCase() || '',
          lat,
          lon,
        })),
      );
  }
}
