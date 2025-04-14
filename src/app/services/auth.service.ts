import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  async signInWithGoogle() {
    try {
      const result = await this.afAuth.signInWithPopup(new GoogleAuthProvider());
      if (result.user) {
        localStorage.setItem('userId', result.user.uid);
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion avec Google:', error);
    }
  }

  async signOut() {
    try {
      await this.afAuth.signOut();
      localStorage.removeItem('userId');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  getCurrentUser() {
    return this.afAuth.authState;
  }

  getStoredUserId(): string | null {
    return localStorage.getItem('userId');
  }

  isUserStored(): boolean {
    return !!this.getStoredUserId();
  }
} 