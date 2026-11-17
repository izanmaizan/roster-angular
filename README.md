# Roster

Aplikasi penjadwalan shift karyawan. Angular 22 dengan signals, guard peran (RBAC), dan jadwal drag-and-drop.

## Tech stack

| Bagian | Teknologi |
|---|---|
| Framework | Angular 22, standalone component, signals |
| Bahasa | TypeScript |
| Routing | Angular Router + guard |
| Styling | Tailwind CSS 4 + daisyUI 5, tema terang dan gelap |
| Uji | Vitest |
| Sajian | nginx, Docker multi-stage |

## Alur singkat

1. Pengguna memilih akun. Sesi disimpan, guard memeriksa login.
2. Manajer menyeret shift ke sel lain. Form menolak bentrok dan batas jam mingguan.
3. Staf melihat jadwal dan mengajukan tukar shift.
4. Manajer menyetujui atau menolak. Jika disetujui, jadwal langsung berubah.

## Peran

| Aksi | Staf | Manajer |
|---|---|---|
| Lihat jadwal | ya | ya |
| Tambah, pindah, hapus shift | tidak | ya |
| Ajukan tukar shift | ya | ya |
| Setujui atau tolak tukar | tidak | ya |

## Menjalankan

```bash
npm ci
npm start
```

Buka `http://localhost:4200`.

```bash
npx ng build
npx ng test --watch=false
```

Docker:

```bash
docker build -t roster .
docker run --rm -p 4200:80 roster
```

## Struktur

```
src/app/app.ts                     kerangka, tema, sesi
src/app/app.routes.ts              rute lazy dan guard
src/app/core/model.ts              tipe dan data karyawan
src/app/core/roster.service.ts     shift, aturan jam, tukar shift
src/app/core/sesi.ts               sesi dan izin peran
src/app/core/notif.ts              notifikasi singkat
src/app/fitur/masuk/               pilih akun
src/app/fitur/minggu/              kalender mingguan
src/app/fitur/tukar/               pengajuan tukar shift
```

## Catatan

Tanpa backend dan tanpa kata sandi. Data disimpan di `localStorage` dengan kunci `roster-v1`. Hapus kunci itu untuk kembali ke data awal.
