import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    // Vérifier d'abord le localStorage
    if (this.authService.isUserStored()) {
      return true;
    }

    // Si pas dans le localStorage, vérifier l'état d'authentification Firebase
    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (user) {
          // Stocker l'ID de l'utilisateur dans le localStorage
          localStorage.setItem('userId', user.uid);
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
} 