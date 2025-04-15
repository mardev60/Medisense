import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div class="relative">
        <!-- Background decorative elements -->
        <div class="absolute -top-32 -left-32 w-64 h-64 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
        <div class="absolute -bottom-32 -right-32 w-64 h-64 bg-green-100 rounded-full opacity-20 animate-pulse delay-300"></div>
        
        <!-- Main content -->
        <div class="bg-white p-12 rounded-3xl shadow-2xl relative z-10 backdrop-blur-sm bg-opacity-90">
          <div class="text-center mb-10">
            <div class="flex justify-center mb-6 app-title">
              <img src="https://i.ibb.co/wZ1d3vT3/Medisense-icon.png" alt="Medisense Logo" class="w-28">
            </div>
            <h1 class="app-title text-6xl mb-4">Medisense</h1>
            <p class="text-gray-600 text-lg mb-8">Votre assistant médical intelligent</p>
            
            <div class="max-w-lg mx-auto space-y-4 text-gray-600">
              <p class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Comprenez vos résultats médicaux en quelques secondes
              </p>
              <p class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Posez vos questions en langage naturel
              </p>
              <p class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Réponses instantanées et précises
              </p>
            </div>
          </div>
          
          <div class="flex justify-center">
            <button 
              (click)="loginWithGoogle()" 
              class="w-64 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-8 py-4 text-gray-700 hover:bg-gray-50 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-base">
              <img src="https://www.google.com/favicon.ico" alt="Google" class="w-6 h-6">
              <span class="font-medium">Se connecter</span>
            </button>
          </div>
        </div>
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