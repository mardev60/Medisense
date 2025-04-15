import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

export interface Message {
  text: string;
  isUser: boolean;
}

interface ChatResponse {
  answer: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="flex justify-between items-center mb-4 p-4 border-b">
        <button (click)="goBack.emit()" class="btn-back flex items-center text-gray-600 hover:text-gray-800">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Charger un nouveau document
        </button>
        <span class="text-sm text-gray-500">Document actif</span>
      </div>

      <div class="flex-1 overflow-y-auto mb-4 p-4" #chatContainer>
        <div *ngFor="let message of messages" 
             [ngClass]="{'message': true, 'user-message': message.isUser, 'ai-message': !message.isUser}">
          {{ message.text }}
        </div>
      </div>

      <div class="border-t p-4 bg-white rounded-b-2xl">
        <div class="flex gap-3">
          <input type="text" 
                 [(ngModel)]="userInput" 
                 (keyup.enter)="sendMessage()"
                 placeholder="Posez votre question sur le document..."
                 [disabled]="isLoading"
                 class="chat-input">
          <button (click)="sendMessage()" 
                  [disabled]="!userInput || isLoading"
                  class="btn-primary flex items-center">
            <span>Envoyer</span>
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit {
  @Input() messages: Message[] = [];
  @Output() goBack = new EventEmitter<void>();

  userInput = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.messages.length === 0) {
      this.addBotMessage('Bonjour ! Je suis votre assistant médical. Comment puis-je vous aider ?');
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput;
    this.addUserMessage(userMessage);
    this.userInput = '';
    this.isLoading = true;

    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (!user) {
        console.error('Utilisateur non connecté');
        this.addBotMessage('Erreur d\'authentification. Veuillez vous reconnecter.');
        this.isLoading = false;
        return;
      }

      this.http.post<ChatResponse>(`${environment.apiUrl}/ask`, {
        question: userMessage,
        user_id: user.uid,
        pdf_id: localStorage.getItem('currentPdfId')
      }).subscribe({
        next: (response) => {
          this.addBotMessage(response.answer);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.addBotMessage('Désolé, une erreur est survenue. Veuillez réessayer.');
          this.isLoading = false;
        }
      });
    });
  }

  private addUserMessage(text: string) {
    this.messages.push({ text, isUser: true });
  }

  private addBotMessage(text: string) {
    this.messages.push({ text, isUser: false });
  }
}