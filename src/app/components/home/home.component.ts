import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent, UploadedFile } from '../file-upload/file-upload.component';
import { ChatComponent, Message } from '../chat/chat.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FileUploadComponent, ChatComponent],
  template: `
    <div class="min-h-screen p-4 bg-gradient-to-br from-green-50 via-white to-green-100">
      <div class="flex justify-end mb-4">
        <button (click)="logout()" class="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-300">
          <span>Déconnexion</span>
        </button>
      </div>

      <app-file-upload
        *ngIf="!documentLoaded"
        [previousFiles]="previousFiles"
        (fileUploaded)="onFileUploaded()"
      ></app-file-upload>

      <app-chat
        *ngIf="documentLoaded"
        [messages]="messages"
        (goBack)="goBack()"
      ></app-chat>
    </div>
  `
})
export class HomeComponent implements OnInit {
  documentLoaded = false;
  messages: Message[] = [];
  previousFiles: UploadedFile[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeChat();
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  }

  onFileUploaded() {
    this.documentLoaded = true;
    this.messages.push({
      text: "Le document a été chargé avec succès. Je suis prêt à répondre à vos questions.",
      isUser: false
    });
  }

  goBack() {
    this.documentLoaded = false;
    this.messages = [];
    this.initializeChat();
  }

  private initializeChat() {
    this.messages = [{
      text: "Bonjour ! Je suis votre assistant Medisense. Une fois que vous aurez chargé votre document, je pourrai répondre à vos questions à son sujet.",
      isUser: false
    }];
  }
}