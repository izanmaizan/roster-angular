import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RosterService } from './roster.service';

describe('RosterService', () => {
  let roster: RosterService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    roster = TestBed.inject(RosterService);
  });

  it('menghitung jam minggu berjalan', () => {
    expect(roster.jam('K2')).toBe(24);
  });

  it('menambah shift ke sel kosong', () => {
    expect(roster.tambahShift({ karyawanId: 'K1', tanggal: roster.hari()[2], mulai: '07:00', selesai: '15:00' })).toBeNull();
    expect(roster.shiftPada('K1', roster.hari()[2])).toBeDefined();
    expect(roster.jam('K1')).toBe(8);
  });

  it('menolak shift yang bentrok', () => {
    expect(roster.tambahShift({ karyawanId: 'K2', tanggal: roster.hari()[0], mulai: '10:00', selesai: '12:00' })).toMatch(/Bentrok/);
  });

  it('menolak jam selesai sebelum jam mulai', () => {
    expect(roster.tambahShift({ karyawanId: 'K4', tanggal: roster.hari()[6], mulai: '15:00', selesai: '07:00' })).toMatch(/setelah jam mulai/);
  });

  it('menolak melebihi batas jam mingguan', () => {
    expect(roster.tambahShift({ karyawanId: 'K2', tanggal: roster.hari()[5], mulai: '07:00', selesai: '15:00' })).toBeNull();
    expect(roster.tambahShift({ karyawanId: 'K2', tanggal: roster.hari()[6], mulai: '07:00', selesai: '15:00' })).toBeNull();
    expect(roster.tambahShift({ karyawanId: 'K2', tanggal: roster.hari()[1], mulai: '07:00', selesai: '08:30' })).toMatch(/Melebihi/);
  });

  it('memindahkan shift ke hari kosong', () => {
    expect(roster.pindahShift('S1', 'K3', roster.hari()[6])).toBeNull();
    expect(roster.shift().find((s) => s.id === 'S1')?.karyawanId).toBe('K3');
  });

  it('menolak pindah yang membuat bentrok', () => {
    expect(roster.pindahShift('S6', 'K3', roster.hari()[3])).toMatch(/Bentrok/);
  });

  it('menghapus shift', () => {
    roster.hapusShift('S5');
    expect(roster.jam('K4')).toBe(0);
  });

  it('membuat pengajuan tukar baru', () => {
    expect(roster.ajukanTukar('S1', 'K3', 'Kontrol dokter.')).toBeNull();
    expect(roster.tukar().length).toBe(2);
    expect(roster.tukar()[0].status).toBe('menunggu');
  });

  it('menolak pengajuan dengan pengganti sama dengan pengaju', () => {
    expect(roster.ajukanTukar('S1', 'K2', 'Kontrol dokter.')).toMatch(/tidak boleh sama/);
  });

  it('mengubah pengajuan milik sendiri selama menunggu', () => {
    expect(roster.ubahTukar('T1', 'K2', 'K4', 'Alasan baru.')).toBeNull();
    const t = roster.tukar().find((x) => x.id === 'T1');
    expect(t?.penggantiId).toBe('K4');
    expect(t?.alasan).toBe('Alasan baru.');
  });

  it('menolak ubah oleh bukan pengaju', () => {
    expect(roster.ubahTukar('T1', 'K3', 'K4', 'Alasan.')).toMatch(/Hanya pengaju/);
  });

  it('membatalkan pengajuan milik sendiri', () => {
    expect(roster.hapusTukar('T1', 'K2')).toBeNull();
    expect(roster.tukar().find((x) => x.id === 'T1')).toBeUndefined();
  });

  it('menolak batal oleh bukan pengaju', () => {
    expect(roster.hapusTukar('T1', 'K4')).toMatch(/Hanya pengaju/);
  });

  it('memindahkan shift ke pengganti saat tukar disetujui', () => {
    expect(roster.setujui('T1')).toBeNull();
    expect(roster.shift().find((s) => s.id === 'S6')?.karyawanId).toBe('K3');
    expect(roster.setujui('T1')).toMatch(/tidak bisa diproses/);
  });

  it('tidak bisa menyetujui pengajuan yang sudah dibatalkan', () => {
    roster.hapusTukar('T1', 'K2');
    expect(roster.setujui('T1')).toMatch(/tidak bisa diproses/);
  });

  it('menolak pengajuan dan tidak mengubah jadwal', () => {
    expect(roster.tolak('T1')).toBeNull();
    expect(roster.shift().find((s) => s.id === 'S6')?.karyawanId).toBe('K2');
    expect(roster.tolak('T1')).toMatch(/tidak bisa diproses/);
  });
});
