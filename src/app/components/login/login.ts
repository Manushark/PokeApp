import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });
  errorMessage = '';

  constructor(private router: Router) {
    // Si ya está logueado, lo mandamos al Home directamente
    if (localStorage.getItem('currentUser')) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.getRawValue();

    // Credenciales válidas de prueba
    if (username === 'Entrenador' && password === '1234') {
      // Guardamos la sesión
      const userSession = { username: username, loggedInAt: new Date().toISOString() };
      localStorage.setItem('currentUser', JSON.stringify(userSession));

      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Credenciales incorrectas. Pista: Entrenador / 1234';
    }
  }
}
