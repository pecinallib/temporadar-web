import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GeocodingService } from '../../../../core/services';
import { Location } from '../../../../core/models';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full">
      <div
        class="flex items-center gap-2 px-4 py-2 rounded-2xl
                  bg-white/80 dark:bg-tr-card-dark/80
                  border border-tr-peach/40 dark:border-tr-terra/20
                  shadow-sm backdrop-blur-sm"
      >
        <span class="text-tr-terra dark:text-tr-peach text-lg">🔍</span>
        <input
          type="text"
          [(ngModel)]="query"
          (ngModelChange)="onQueryChange($event)"
          placeholder="Buscar cidade..."
          class="flex-1 bg-transparent outline-none text-sm
                 text-gray-700
                 placeholder-gray-400
                 font-inter"
        />
        <button
          (click)="onLocationClick()"
          title="Usar minha localização"
          class="text-tr-terra dark:text-tr-peach hover:opacity-70 transition-opacity"
        >
          📍
        </button>
      </div>

      <!-- Dropdown de resultados -->
      <ul
        *ngIf="results.length > 0"
        class="absolute top-full left-0 right-0 mt-1 z-50
                 bg-white dark:bg-tr-card-dark
                 border border-tr-peach/30 dark:border-tr-terra/20
                 rounded-2xl shadow-lg overflow-hidden"
      >
        <li
          *ngFor="let result of results"
          (click)="selectLocation(result)"
          class="px-4 py-3 cursor-pointer text-sm
                   text-gray-700
                   hover:bg-tr-peach/20 dark:hover:bg-tr-terra/20
                   transition-colors font-inter"
        >
          {{ result.city }}, {{ result.country }}
        </li>
      </ul>
    </div>
  `,
})
export class SearchBarComponent {
  @Output() locationSelected = new EventEmitter<Location>();
  @Output() useMyLocation = new EventEmitter<void>();

  query = '';
  results: Location[] = [];
  private search$ = new Subject<string>();

  constructor(private geocoding: GeocodingService) {
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => this.geocoding.search(q)),
      )
      .subscribe((locations) => (this.results = locations));
  }

  onQueryChange(value: string): void {
    if (value.length >= 3) this.search$.next(value);
    else this.results = [];
  }

  selectLocation(location: Location): void {
    this.query = `${location.city}, ${location.country}`;
    this.results = [];
    this.locationSelected.emit(location);
  }

  onLocationClick(): void {
    this.results = [];
    this.query = '';
    this.useMyLocation.emit();
  }
}
