import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesi } from './sesi';

export const wajibMasuk: CanActivateFn = () =>
  inject(Sesi).id() ? true : inject(Router).parseUrl('/masuk');
