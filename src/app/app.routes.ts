import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
