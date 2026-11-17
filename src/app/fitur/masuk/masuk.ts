import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KARYAWAN, inisial } from '../../core/model';
import { Sesi } from '../../core/sesi';

@Component({
  selector: 'app-masuk',
  templateUrl: './masuk.html',
})
export class Masuk {
  private readonly sesi = inject(Sesi);
  private readonly router = inject(Router);
  readonly karyawan = KARYAWAN;
  readonly inisial = inisial;

  pilih(id: string): void {
    this.sesi.masuk(id);
    this.router.navigateByUrl('/minggu');
  }
}
