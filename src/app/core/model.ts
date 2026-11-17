export type Peran = 'manajer' | 'staf';
export type StatusTukar = 'menunggu' | 'disetujui' | 'ditolak';

export interface Karyawan {
  id: string;
  nama: string;
  peran: Peran;
  unit: string;
}

export interface Shift {
  id: string;
  karyawanId: string;
  tanggal: string;
  mulai: string;
  selesai: string;
}

export interface Tukar {
  id: string;
  shiftId: string;
  pengajuId: string;
  penggantiId: string;
  alasan: string;
  status: StatusTukar;
  dibuat: string;
}

export const KARYAWAN: Karyawan[] = [
  { id: 'K1', nama: 'Rina Hartati', peran: 'manajer', unit: 'IGD' },
  { id: 'K2', nama: 'Budi Santoso', peran: 'staf', unit: 'IGD' },
  { id: 'K3', nama: 'Sari Wulandari', peran: 'staf', unit: 'IGD' },
  { id: 'K4', nama: 'Dedi Pratama', peran: 'staf', unit: 'Rawat Inap' },
];

export const namaKaryawan = (id: string): string => KARYAWAN.find((k) => k.id === id)?.nama ?? id;

export const inisial = (nama: string): string =>
  nama
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('');
