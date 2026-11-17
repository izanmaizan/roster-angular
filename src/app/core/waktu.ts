const pad = (n: number) => String(n).padStart(2, '0');

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const menit = (jam: string): number => {
  const [h, m] = jam.split(':').map(Number);
  return h * 60 + m;
};

export function iso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function hariIni(): string {
  return iso(new Date());
}

export function geser(tanggal: string, n: number): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  return iso(new Date(y, m - 1, d + n));
}

export function senin(tanggal: string): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  const selisih = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return geser(tanggal, -selisih);
}

export function durasi(mulai: string, selesai: string): number {
  return (menit(selesai) - menit(mulai)) / 60;
}

export function tanggalPendek(tanggal: string): string {
  const [y, m, d] = tanggal.split('-').map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
}
