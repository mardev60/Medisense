import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: false,
})
export class DashboardComponent implements OnInit {
  userId: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userId = this.authService.getStoredUserId();
  }

  signOut() {
    this.authService.signOut();
  }
} 