import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, catchError, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Coordinates } from '../models';

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private http: HttpClient) {}

  getLocation(): Observable<Coordinates> {
    return this.getByBrowser().pipe(catchError(() => this.getByIP()));
  }

  private getByBrowser(): Observable<Coordinates> {
    return from(
      new Promise<Coordinates>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject('Geolocation not supported');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            }),
          (err) => reject(err),
        );
      }),
    );
  }

  private getByIP(): Observable<Coordinates> {
    return this.http.get<any>('https://ip-api.com/json').pipe(
      map((res) => ({ lat: res.lat, lon: res.lon })),
      catchError(() => of({ lat: -22.8791, lon: -42.0232 })), // fallback: Araruama
    );
  }
}
