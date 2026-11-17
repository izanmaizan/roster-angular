import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { KARYAWAN, Tukar as Pengajuan, namaKaryawan } from '../../core/model';
import { Notif } from '../../core/notif';
import { RosterService } from '../../core/roster.service';
import { Sesi } from '../../core/sesi';
import { hariIni, tanggalPendek } from '../../core/waktu';

@Component({
  selector: 'app-tukar',
  imports: [FormsModule],
  templateUrl: './tukar.html',
})
export class Tukar {
  readonly roster = inject(RosterService);
  readonly sesi = inject(Sesi);
  private readonly notif = inject(Notif);
  readonly karyawan = KARYAWAN;
  readonly nama = namaKaryawan;
  readonly tanggalPendek = tanggalPendek;

  readonly shiftSaya = computed(() => {
    const id = this.sesi.pengguna()?.id;
    const kini = hariIni();
    return this.roster.shift().filter((s) => s.karyawanId === id && s.tanggal >= kini);
  });

  readonly pengganti = computed(() => KARYAWAN.filter((k) => k.id !== this.sesi.pengguna()?.id));

  readonly daftar = computed(() => {
    const p = this.sesi.pengguna();
    if (!p) return [];
    const manajer = this.sesi.boleh('setujuiTukar');
    return this.roster
      .tukar()
      .filter((t) => manajer || t.pengajuId === p.id || t.penggantiId === p.id);
  });

  readonly editId = signal<string | null>(null);
  draf = { shiftId: inject(ActivatedRoute).snapshot.queryParamMap.get('shift') ?? '', penggantiId: '', alasan: '' };
  ubah = { penggantiId: '', alasan: '' };

  info(shiftId: string): string {
    const s = this.roster.shift().find((x) => x.id === shiftId);
    return s ? `${tanggalPendek(s.tanggal)} · ${s.mulai}–${s.selesai}` : shiftId;
  }

  bisaUbah(t: Pengajuan): boolean {
    return t.status === 'menunggu' && t.pengajuId === this.sesi.pengguna()?.id;
  }

  ajukan(): void {
    if (!this.sesi.boleh('ajukanTukar')) {
      this.notif.kabar('galat', 'Tidak punya izin mengajukan tukar.');
      return;
    }
    const galat = this.roster.ajukanTukar(this.draf.shiftId, this.draf.penggantiId, this.draf.alasan);
    this.notif.kabarDari(galat, 'Pengajuan terkirim.');
    if (!galat) this.draf = { shiftId: '', penggantiId: '', alasan: '' };
  }

  mulaiUbah(t: Pengajuan): void {
    this.editId.set(t.id);
    this.ubah = { penggantiId: t.penggantiId, alasan: t.alasan };
  }

  batalUbah(): void {
    this.editId.set(null);
  }

  simpanUbah(t: Pengajuan): void {
    const p = this.sesi.pengguna();
    if (!p) return;
    const galat = this.roster.ubahTukar(t.id, p.id, this.ubah.penggantiId, this.ubah.alasan);
    this.notif.kabarDari(galat, 'Pengajuan diperbarui.');
    if (!galat) this.editId.set(null);
  }

  batalkan(t: Pengajuan): void {
    const p = this.sesi.pengguna();
    if (!p) return;
    this.notif.kabarDari(this.roster.hapusTukar(t.id, p.id), 'Pengajuan dibatalkan.');
  }

  setujui(id: string): void {
    if (!this.sesi.boleh('setujuiTukar')) return;
    this.notif.kabarDari(this.roster.setujui(id), 'Tukar disetujui, jadwal diperbarui.');
  }

  tolak(id: string): void {
    if (!this.sesi.boleh('setujuiTukar')) return;
    this.notif.kabarDari(this.roster.tolak(id), 'Pengajuan ditolak.');
  }
}
