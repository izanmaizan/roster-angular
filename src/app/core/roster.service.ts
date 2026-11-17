import { Injectable, computed, effect, signal } from '@angular/core';
import { KARYAWAN, Shift, Tukar } from './model';
import { durasi, geser, hariIni, senin } from './waktu';

export const BATAS_JAM = 40;
const KUNCI = 'roster-v2';

interface Keadaan {
  shift: Shift[];
  tukar: Tukar[];
}

const acak = (): string => Math.random().toString(36).slice(2, 10);

function awal(): Keadaan {
  const m = senin(hariIni());
  const d = (n: number) => geser(m, n);
  return {
    shift: [
      { id: 'S1', karyawanId: 'K2', tanggal: d(0), mulai: '07:00', selesai: '15:00' },
      { id: 'S2', karyawanId: 'K3', tanggal: d(0), mulai: '15:00', selesai: '23:00' },
      { id: 'S3', karyawanId: 'K2', tanggal: d(2), mulai: '07:00', selesai: '15:00' },
      { id: 'S4', karyawanId: 'K3', tanggal: d(3), mulai: '15:00', selesai: '23:00' },
      { id: 'S5', karyawanId: 'K4', tanggal: d(1), mulai: '07:00', selesai: '15:00' },
      { id: 'S6', karyawanId: 'K2', tanggal: d(4), mulai: '15:00', selesai: '23:00' },
    ],
    tukar: [
      { id: 'T1', shiftId: 'S6', pengajuId: 'K2', penggantiId: 'K3', alasan: 'Ada acara keluarga.', status: 'menunggu', dibuat: new Date().toISOString() },
    ],
  };
}

@Injectable({ providedIn: 'root' })
export class RosterService {
  readonly karyawan = KARYAWAN;
  private readonly keadaan = signal<Keadaan>(this.muat());

  readonly shift = computed(() => this.keadaan().shift);
  readonly tukar = computed(() => this.keadaan().tukar);
  readonly minggu = signal(senin(hariIni()));
  readonly hari = computed(() => Array.from({ length: 7 }, (_, i) => geser(this.minggu(), i)));
  readonly shiftMinggu = computed(() => {
    const hari = new Set(this.hari());
    return this.shift().filter((s) => hari.has(s.tanggal));
  });
  readonly jamMinggu = computed(() => {
    const peta = new Map<string, number>();
    for (const s of this.shiftMinggu()) {
      peta.set(s.karyawanId, (peta.get(s.karyawanId) ?? 0) + durasi(s.mulai, s.selesai));
    }
    return peta;
  });

  constructor() {
    effect(() => localStorage.setItem(KUNCI, JSON.stringify(this.keadaan())));
  }

  jam(karyawanId: string): number {
    return this.jamMinggu().get(karyawanId) ?? 0;
  }

  jumlahPada(tanggal: string): number {
    return this.shiftMinggu().filter((s) => s.tanggal === tanggal).length;
  }

  shiftPada(karyawanId: string, tanggal: string): Shift | undefined {
    return this.shiftMinggu().find((s) => s.karyawanId === karyawanId && s.tanggal === tanggal);
  }

  pindah(arah: number): void {
    this.minggu.update((m) => geser(m, arah * 7));
  }

  kembaliKeKini(): void {
    this.minggu.set(senin(hariIni()));
  }

  tambahShift(masukan: Omit<Shift, 'id'>): string | null {
    const galat = this.periksa(masukan, null);
    if (galat) return galat;
    this.keadaan.update((k) => ({ ...k, shift: [...k.shift, { ...masukan, id: acak() }] }));
    return null;
  }

  pindahShift(id: string, karyawanId: string, tanggal: string): string | null {
    const s = this.keadaan().shift.find((x) => x.id === id);
    if (!s) return 'Shift tidak ditemukan.';
    const galat = this.periksa({ karyawanId, tanggal, mulai: s.mulai, selesai: s.selesai }, id);
    if (galat) return galat;
    this.keadaan.update((k) => ({
      ...k,
      shift: k.shift.map((x) => (x.id === id ? { ...x, karyawanId, tanggal } : x)),
    }));
    return null;
  }

  hapusShift(id: string): void {
    this.keadaan.update((k) => ({ ...k, shift: k.shift.filter((x) => x.id !== id) }));
  }

  ajukanTukar(shiftId: string, penggantiId: string, alasan: string): string | null {
    const s = this.keadaan().shift.find((x) => x.id === shiftId);
    if (!s) return 'Pilih shift terlebih dahulu.';
    const galat = this.validasiTukar(s.karyawanId, penggantiId, alasan);
    if (galat) return galat;
    const baru: Tukar = {
      id: acak(),
      shiftId,
      pengajuId: s.karyawanId,
      penggantiId,
      alasan: alasan.trim(),
      status: 'menunggu',
      dibuat: new Date().toISOString(),
    };
    this.keadaan.update((k) => ({ ...k, tukar: [baru, ...k.tukar] }));
    return null;
  }

  ubahTukar(id: string, pengajuId: string, penggantiId: string, alasan: string): string | null {
    const t = this.keadaan().tukar.find((x) => x.id === id);
    if (!t || t.status !== 'menunggu') return 'Pengajuan tidak bisa diubah.';
    if (t.pengajuId !== pengajuId) return 'Hanya pengaju yang bisa mengubah.';
    const galat = this.validasiTukar(t.pengajuId, penggantiId, alasan);
    if (galat) return galat;
    this.keadaan.update((k) => ({
      ...k,
      tukar: k.tukar.map((x) => (x.id === id ? { ...x, penggantiId, alasan: alasan.trim() } : x)),
    }));
    return null;
  }

  hapusTukar(id: string, pengajuId: string): string | null {
    const t = this.keadaan().tukar.find((x) => x.id === id);
    if (!t || t.status !== 'menunggu') return 'Pengajuan tidak bisa dibatalkan.';
    if (t.pengajuId !== pengajuId) return 'Hanya pengaju yang bisa membatalkan.';
    this.keadaan.update((k) => ({ ...k, tukar: k.tukar.filter((x) => x.id !== id) }));
    return null;
  }

  setujui(id: string): string | null {
    const k = this.keadaan();
    const t = k.tukar.find((x) => x.id === id);
    if (!t || t.status !== 'menunggu') return 'Pengajuan tidak bisa diproses.';
    const s = k.shift.find((x) => x.id === t.shiftId);
    if (!s || s.karyawanId !== t.pengajuId) return 'Shift sudah tidak milik pengaju.';
    const galat = this.periksa({ karyawanId: t.penggantiId, tanggal: s.tanggal, mulai: s.mulai, selesai: s.selesai }, s.id);
    if (galat) return galat;
    this.keadaan.set({
      shift: k.shift.map((x) => (x.id === s.id ? { ...x, karyawanId: t.penggantiId } : x)),
      tukar: k.tukar.map((x) => (x.id === id ? { ...x, status: 'disetujui' } : x)),
    });
    return null;
  }

  tolak(id: string): string | null {
    const t = this.keadaan().tukar.find((x) => x.id === id);
    if (!t || t.status !== 'menunggu') return 'Pengajuan tidak bisa diproses.';
    this.keadaan.update((k) => ({
      ...k,
      tukar: k.tukar.map((x) => (x.id === id ? { ...x, status: 'ditolak' } : x)),
    }));
    return null;
  }

  private validasiTukar(pengajuId: string, penggantiId: string, alasan: string): string | null {
    if (!KARYAWAN.some((k) => k.id === penggantiId)) return 'Pilih pengganti.';
    if (penggantiId === pengajuId) return 'Pengganti tidak boleh sama dengan pengaju.';
    if (!alasan.trim()) return 'Alasan wajib diisi.';
    return null;
  }

  private periksa(s: Omit<Shift, 'id'>, abaikan: string | null): string | null {
    if (!s.tanggal) return 'Tanggal wajib diisi.';
    if (!s.mulai || !s.selesai) return 'Jam mulai dan selesai wajib diisi.';
    if (durasi(s.mulai, s.selesai) <= 0) return 'Jam selesai harus setelah jam mulai.';
    const milik = this.keadaan().shift.filter((x) => x.id !== abaikan && x.karyawanId === s.karyawanId);
    if (milik.some((x) => x.tanggal === s.tanggal && s.mulai < x.selesai && x.mulai < s.selesai)) {
      return 'Bentrok dengan shift lain di hari yang sama.';
    }
    const minggu = senin(s.tanggal);
    const total = milik.filter((x) => senin(x.tanggal) === minggu).reduce((a, x) => a + durasi(x.mulai, x.selesai), 0);
    if (total + durasi(s.mulai, s.selesai) > BATAS_JAM) return `Melebihi batas ${BATAS_JAM} jam per minggu.`;
    return null;
  }

  private muat(): Keadaan {
    try {
      const isi = localStorage.getItem(KUNCI);
      if (isi) return JSON.parse(isi) as Keadaan;
    } catch {
      localStorage.removeItem(KUNCI);
    }
    return awal();
  }
}
