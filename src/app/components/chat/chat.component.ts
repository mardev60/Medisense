import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

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
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  template: `
    <div class="flex h-screen">
      <!-- Chat Container -->
      <div class="flex-1 flex flex-col transition-all duration-300" 
           [ngClass]="{'ml-0': !isPdfExpanded, '-ml-52': isPdfExpanded}">
        <div class="chat-container h-full flex flex-col">
          <div class="flex justify-between items-center mb-4 p-4 border-b">
            <button (click)="goBack.emit()" class="btn-back flex items-center text-gray-600 hover:text-gray-800">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Charger un nouveau document
            </button>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-500">Document actif</span>
              <button 
                (click)="togglePdf()" 
                class="p-2 text-gray-600 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                [title]="isPdfExpanded ? 'Masquer le document' : 'Afficher le document'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto mb-4 p-4" #chatContainer>
            <div *ngFor="let message of messages" 
                 [ngClass]="{'message': true, 'user-message': message.isUser, 'ai-message': !message.isUser}">
              {{ message.text }}
            </div>
            <div *ngIf="isLoading" class="message ai-message">
              <div class="flex items-center space-x-2">
                <span>Je réfléchis</span>
                <div class="flex space-x-1">
                  <span class="animate-bounce" style="animation-delay: 0ms">.</span>
                  <span class="animate-bounce" style="animation-delay: 150ms">.</span>
                  <span class="animate-bounce" style="animation-delay: 300ms">.</span>
                </div>
              </div>
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
      </div>

      <!-- PDF Viewer -->
      <div class="w-1/3 border-l bg-gray-50 transition-all duration-300 fixed right-0 h-full" 
           [ngClass]="{'translate-x-0': isPdfExpanded, 'translate-x-full': !isPdfExpanded}">
        <div class="h-full flex flex-col">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-800">Document PDF</h3>
            <button 
              (click)="togglePdf()" 
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Fermer le document">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-hidden">
            <iframe 
              [src]="pdfUrl | safeUrl" 
              class="w-full h-full"
              frameborder="0">
            </iframe>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-bounce {
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @Input() messages: Message[] = [];
  @Output() goBack = new EventEmitter<void>();

  userInput = '';
  isLoading = false;
  isPdfExpanded = false;
  pdfUrl = '';
  private shouldScroll = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.messages.length === 0) {
      this.addBotMessage('Bonjour ! Je suis votre assistant médical. Comment puis-je vous aider ?');
    }
    this.loadPdfUrl();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Erreur lors du défilement:', err);
    }
  }

  togglePdf() {
    this.isPdfExpanded = !this.isPdfExpanded;
  }

  private loadPdfUrl() {
    const pdfId = localStorage.getItem('currentPdfId');
    const storageUrl = localStorage.getItem('storage_url');
    if (pdfId && storageUrl) {
      this.pdfUrl = storageUrl;
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
    this.shouldScroll = true;
  }

  private addBotMessage(text: string) {
    this.messages.push({ text, isUser: false });
    this.shouldScroll = true;
  }
}