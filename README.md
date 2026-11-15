# Roster

Aplikasi penjadwalan shift karyawan. SPA Angular untuk belajar signals, state management, form kompleks, dan RBAC.

## Tech stack

| Bagian | Teknologi |
|---|---|
| Framework | Angular 22, standalone component |
| Bahasa | TypeScript 5.9 |
| Routing | Angular Router + guard |
| Styling | SCSS |
| Build | Angular CLI (esbuild) |
| Rencana | NgRx untuk state, REST backend terpisah, Vitest/Jest |

## Alur singkat

1. Staf masuk, sesi disimpan, guard memeriksa role.
2. Manajer membuka kalender dan menaruh shift dengan drag-drop.
3. Form menolak shift yang bentrok atau melebihi batas jam.
4. Staf melihat jadwalnya dan mengajukan tukar shift.
5. Manajer menyetujui, kalender diperbarui.

## Menjalankan

```bash
npm install
npm run start
```

Buka `http://localhost:4200`.

```bash
npm run build
npm test
```

## Struktur

```
src/app/app.routes.ts     daftar rute
src/app/app.config.ts     provider aplikasi
src/main.ts               bootstrap
```

## Status

Scaffold Angular CLI. Routing aktif, halaman default masih halaman sambutan.
