import { Injectable, computed, signal } from '@angular/core';
import { KARYAWAN, Peran } from './model';

export type Aksi = 'lihat' | 'jadwalkan' | 'ajukanTukar' | 'setujuiTukar';

const IZIN: Record<Aksi, Peran[]> = {
  lihat: ['manajer', 'staf'],
  jadwalkan: ['manajer'],
  ajukanTukar: ['manajer', 'staf'],
  setujuiTukar: ['manajer'],
};

export function bolehPeran(peran: Peran | null, aksi: Aksi): boolean {
  return peran !== null && IZIN[aksi].includes(peran);
}

const KUNCI = 'sesi-roster';

@Injectable({ providedIn: 'root' })
export class Sesi {
  readonly id = signal<string | null>(localStorage.getItem(KUNCI));
  readonly pengguna = computed(() => KARYAWAN.find((k) => k.id === this.id()) ?? null);
  readonly peran = computed(() => this.pengguna()?.peran ?? null);

  masuk(id: string): void {
    localStorage.setItem(KUNCI, id);
    this.id.set(id);
  }

  keluar(): void {
    localStorage.removeItem(KUNCI);
    this.id.set(null);
  }

  boleh(aksi: Aksi): boolean {
    return bolehPeran(this.peran(), aksi);
  }
}
