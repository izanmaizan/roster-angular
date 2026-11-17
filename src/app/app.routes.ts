import { Routes } from '@angular/router';
import { wajibMasuk } from './core/guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'minggu' },
  {
    path: 'masuk',
    loadComponent: () => import('./fitur/masuk/masuk').then((m) => m.Masuk),
    title: 'Masuk',
  },
  {
    path: 'minggu',
    canActivate: [wajibMasuk],
    loadComponent: () => import('./fitur/minggu/minggu').then((m) => m.Minggu),
    title: 'Jadwal',
  },
  {
    path: 'tukar',
    canActivate: [wajibMasuk],
    loadComponent: () => import('./fitur/tukar/tukar').then((m) => m.Tukar),
    title: 'Tukar shift',
  },
  { path: '**', redirectTo: '' },
];
