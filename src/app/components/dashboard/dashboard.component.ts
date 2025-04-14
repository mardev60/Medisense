import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <div class="dashboard-container">
      <h1>Tableau de bord</h1>
      <div class="user-info">
        <p>ID Utilisateur: {{ userId }}</p>
      </div>
      <button (click)="signOut()" class="logout-btn">
        Se déconnecter
      </button>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    .user-info {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .logout-btn {
      padding: 10px 20px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }
    .logout-btn:hover {
      background-color: #c82333;
    }
  `]
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