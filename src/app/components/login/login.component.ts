import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  signInWithGoogle() {
    this.authService.signInWithGoogle();
  }
} 