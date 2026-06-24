import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './config.html',
  styleUrl: './config.css'
})
export class ConfigComponent {
  themeService = inject(ThemeService);
  username = '';
  loggedInSince = '';

  constructor(private router: Router) {
    const session = localStorage.getItem('currentUser');
    if (session) {
      const userSession = JSON.parse(session);
      this.username = userSession.username;
      this.loggedInSince = new Date(userSession.loggedInAt).toLocaleString();
    }
  }

  // 6. Cerrar Sesión
  logout() {
    // Borramos la sesión del localStorage
    localStorage.removeItem('currentUser');
    // Redirigimos al Login
    this.router.navigate(['/login']);
  }
}
