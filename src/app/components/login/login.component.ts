import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 class="app-title mb-8">Medisense</h1>
        
        <button 
          (click)="loginWithGoogle()" 
          class="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm">
          <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5">
          <span>Se connecter avec Google</span>
        </button>
      </div>
    </div>
  `
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  }
}