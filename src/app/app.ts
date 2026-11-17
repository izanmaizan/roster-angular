import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { inisial } from './core/model';
import { Notif } from './core/notif';
import { Sesi } from './core/sesi';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly sesi = inject(Sesi);
  readonly notif = inject(Notif);
  private readonly router = inject(Router);
  readonly gelap = signal(document.documentElement.dataset['theme'] === 'roster-gelap');
  readonly inisialPengguna = computed(() => {
    const p = this.sesi.pengguna();
    return p ? inisial(p.nama) : '';
  });

  gantiTema(): void {
    this.gelap.update((v) => !v);
    const tema = this.gelap() ? 'roster-gelap' : 'roster';
    document.documentElement.dataset['theme'] = tema;
    localStorage.setItem('tema', tema);
  }

  keluar(): void {
    this.sesi.keluar();
    this.router.navigateByUrl('/masuk');
  }
}
