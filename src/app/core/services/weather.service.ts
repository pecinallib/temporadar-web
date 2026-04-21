import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  WeatherData,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQuality,
  SunTimes,
  Location,
} from '../models';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private airUrl = 'https://air-quality-api.open-meteo.com/v1';

  constructor(private http: HttpClient) {}

  getWeatherData(
    lat: number,
    lon: number,
    location: Location,
  ): Observable<WeatherData> {
    const weather$ = this.http.get<any>(`${this.baseUrl}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'wind_speed_10m',
          'wind_direction_10m',
          'uv_index',
          'visibility',
          'weather_code',
          'is_day',
        ].join(','),
        hourly: [
          'temperature_2m',
          'weather_code',
          'precipitation_probability',
        ].join(','),
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'weather_code',
          'precipitation_probability_max',
          'sunrise',
          'sunset',
        ].join(','),
        timezone: 'auto',
        forecast_days: '7',
      },
    });

    const air$ = this.http.get<any>(`${this.airUrl}/air-quality`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: ['pm2_5', 'pm10', 'ozone', 'european_aqi'].join(','),
      },
    });

    return forkJoin({ weather: weather$, air: air$ }).pipe(
      map(({ weather, air }) => this.mapToWeatherData(weather, air, location)),
    );
  }

  private mapToWeatherData(w: any, a: any, location: Location): WeatherData {
    const c = w.current;

    const current: CurrentWeather = {
      temperature: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      windSpeed: Math.round(c.wind_speed_10m),
      windDirection: c.wind_direction_10m,
      uvIndex: c.uv_index,
      visibility: Math.round(c.visibility / 1000),
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
    };

    const nowHour = new Date().getHours();
    const hourly: HourlyForecast[] = w.hourly.time
      .slice(nowHour, nowHour + 8)
      .map((time: string, i: number) => ({
        time,
        temperature: Math.round(w.hourly.temperature_2m[nowHour + i]),
        weatherCode: w.hourly.weather_code[nowHour + i],
        precipitation: w.hourly.precipitation_probability[nowHour + i],
      }));

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const todayIndex = w.daily.time.findIndex((d: string) => d === today);
    const startIndex = todayIndex >= 0 ? todayIndex : 0;
    const daily: DailyForecast[] = w.daily.time
      .slice(startIndex, startIndex + 7)
      .map((date: string, i: number) => ({
        date,
        tempMax: Math.round(w.daily.temperature_2m_max[startIndex + i]),
        tempMin: Math.round(w.daily.temperature_2m_min[startIndex + i]),
        weatherCode: w.daily.weather_code[startIndex + i],
        precipitationProbability:
          w.daily.precipitation_probability_max[startIndex + i],
      }));

    const aqi = a.current.european_aqi;
    const airQuality: AirQuality = {
      aqi,
      pm25: a.current.pm2_5,
      pm10: a.current.pm10,
      ozone: a.current.ozone,
      ...this.getAqiCategory(aqi),
    };

    const sunTimes: SunTimes = {
      sunrise: w.daily.sunrise[0],
      sunset: w.daily.sunset[0],
    };

    return { location, current, hourly, daily, airQuality, sunTimes };
  }

  private getAqiCategory(aqi: number): {
    category: AirQuality['category'];
    color: string;
  } {
    if (aqi <= 20) return { category: 'Bom', color: '#7a9e7e' };
    if (aqi <= 40) return { category: 'Bom', color: '#7a9e7e' };
    if (aqi <= 60) return { category: 'Moderado', color: '#f5c57a' };
    if (aqi <= 80) return { category: 'Ruim', color: '#c1694f' };
    if (aqi <= 100) return { category: 'Muito Ruim', color: '#9b4dca' };
    return { category: 'Perigoso', color: '#7b0d1e' };
  }
}
