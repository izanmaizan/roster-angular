import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { KARYAWAN, namaKaryawan } from '../../core/model';
import { Notif } from '../../core/notif';
import { BATAS_JAM, RosterService } from '../../core/roster.service';
import { Sesi } from '../../core/sesi';
import { hariIni, tanggalPendek } from '../../core/waktu';

interface Sel {
  karyawanId: string;
  tanggal: string;
}

@Component({
  selector: 'app-minggu',
  imports: [FormsModule, RouterLink],
  templateUrl: './minggu.html',
})
export class Minggu {
  readonly roster = inject(RosterService);
  readonly sesi = inject(Sesi);
  private readonly notif = inject(Notif);
  readonly karyawan = KARYAWAN;
  readonly batas = BATAS_JAM;
  readonly namaHari = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  readonly kini = hariIni();
  readonly rentang = computed(() => {
    const h = this.roster.hari();
    return `${tanggalPendek(h[0])} – ${tanggalPendek(h[6])}`;
  });
  readonly seret = signal<string | null>(null);
  readonly sasaran = signal<string | null>(null);
  readonly modal = signal<Sel | null>(null);
  readonly galatModal = signal<string | null>(null);
  readonly namaModal = computed(() => {
    const m = this.modal();
    return m ? namaKaryawan(m.karyawanId) : '';
  });
  readonly tanggalModal = computed(() => {
    const m = this.modal();
    return m ? tanggalPendek(m.tanggal) : '';
  });
  mulai = '07:00';
  selesai = '15:00';

  get puedeEditar(): boolean {
    return this.sesi.boleh('jadwalkan');
  }

  kunci(karyawanId: string, tanggal: string): string {
    return `${karyawanId}|${tanggal}`;
  }

  bukaModal(karyawanId: string, tanggal: string): void {
    if (!this.puedeEditar) return;
    this.mulai = '07:00';
    this.selesai = '15:00';
    this.galatModal.set(null);
    this.modal.set({ karyawanId, tanggal });
  }

  tutupModal(): void {
    this.modal.set(null);
  }

  simpan(): void {
    const m = this.modal();
    if (!m) return;
    const galat = this.roster.tambahShift({
      karyawanId: m.karyawanId,
      tanggal: m.tanggal,
      mulai: this.mulai,
      selesai: this.selesai,
    });
    if (galat) {
      this.galatModal.set(galat);
      return;
    }
    this.modal.set(null);
    this.notif.kabar('sukses', 'Shift tersimpan.');
  }

  mulaiSeret(id: string, ev: DragEvent): void {
    if (!this.puedeEditar) {
      ev.preventDefault();
      return;
    }
    this.seret.set(id);
    if (ev.dataTransfer) {
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', id);
    }
  }

  akhiriSeret(): void {
    this.seret.set(null);
    this.sasaran.set(null);
  }

  jatuhkan(karyawanId: string, tanggal: string, ev: DragEvent): void {
    ev.preventDefault();
    const id = this.seret();
    this.akhiriSeret();
    if (!id || !this.puedeEditar) return;
    const s = this.roster.shift().find((x) => x.id === id);
    if (!s || (s.karyawanId === karyawanId && s.tanggal === tanggal)) return;
    this.notif.kabarDari(this.roster.pindahShift(id, karyawanId, tanggal), 'Shift dipindahkan.');
  }

  hapus(id: string, ev: Event): void {
    ev.stopPropagation();
    if (!this.puedeEditar) return;
    this.roster.hapusShift(id);
    this.notif.kabar('sukses', 'Shift dihapus.');
  }

  kelebihan(karyawanId: string): boolean {
    return this.roster.jam(karyawanId) > BATAS_JAM;
  }
}
