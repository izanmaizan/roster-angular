import { Injectable, signal } from '@angular/core';

export interface Pesan {
  jenis: 'sukses' | 'galat';
  teks: string;
}

@Injectable({ providedIn: 'root' })
export class Notif {
  readonly pesan = signal<Pesan | null>(null);
  private batas: ReturnType<typeof setTimeout> | undefined;

  kabar(jenis: Pesan['jenis'], teks: string): void {
    clearTimeout(this.batas);
    this.pesan.set({ jenis, teks });
    this.batas = setTimeout(() => this.pesan.set(null), 3500);
  }

  kabarDari(galat: string | null, sukses: string): void {
    if (galat) {
      this.kabar('galat', galat);
    } else {
      this.kabar('sukses', sukses);
    }
  }
}
