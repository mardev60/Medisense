import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

export interface Message {
  text: string;
  isUser: boolean;
  audioUrl?: string;
}

interface ChatResponse {
  answer: string;
  audio?: string;
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
            <div *ngFor="let message of messages; let i = index" 
                 [ngClass]="{'message': true, 'user-message': message.isUser, 'ai-message': !message.isUser}">
              {{ message.text }}
              <div *ngIf="message.audioUrl" class="mt-2">
                <audio #audioPlayer 
                       controls 
                       [src]="message.audioUrl" 
                       class="w-48 h-8"
                       (loadedmetadata)="onAudioLoaded($event, i)">
                </audio>
              </div>
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
                     [disabled]="isLoading || isVoiceMode"
                     class="chat-input">
              <button (click)="sendMessage()" 
                      [disabled]="!userInput || isLoading"
                      class="btn-primary flex items-center"
                      *ngIf="!isVoiceMode">
                <span>Envoyer</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
              <button (click)="toggleVoiceMode()" 
                      class="btn-primary flex items-center"
                      [ngClass]="{'bg-red-500 hover:bg-red-600': isVoiceMode, 'bg-green-500 hover:bg-green-600': !isVoiceMode}">
                <span>{{ isVoiceMode ? 'Arrêter' : 'Mode vocal' }}</span>
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                </svg>
              </button>
            </div>
            <div *ngIf="isVoiceMode" class="mt-4 flex items-center justify-center">
              <div class="flex flex-col items-center">
                <div class="relative">
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                      </svg>
                    </div>
                  </div>
                  <div class="w-24 h-24 rounded-full border-4 border-green-500 animate-pulse"></div>
                </div>
                <p class="mt-4 text-gray-600">{{ isListening ? 'Je vous écoute...' : 'Cliquez sur le bouton pour parler' }}</p>
              </div>
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

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.05);
      }
    }

    audio {
      height: 32px;
      width: 192px;
    }

    audio::-webkit-media-controls-panel {
      background-color: #f3f4f6;
    }

    audio::-webkit-media-controls-current-time-display,
    audio::-webkit-media-controls-time-remaining-display {
      display: none;
    }
  `]
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChildren('audioPlayer') private audioPlayers!: QueryList<ElementRef>;
  @Input() messages: Message[] = [];
  @Output() goBack = new EventEmitter<void>();

  userInput = '';
  isLoading = false;
  isPdfExpanded = false;
  pdfUrl = '';
  private shouldScroll = false;
  isVoiceMode = false;
  isListening = false;
  private recognition: any;
  currentMessageIsVocal = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'fr-FR';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userInput = transcript;
        this.cdr.detectChanges();
        this.sendMessage();
      };

      this.recognition.onerror = (event: any) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        this.isListening = false;
        this.cdr.detectChanges();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cdr.detectChanges();
      };
    }
  }

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

  toggleVoiceMode() {
    this.isVoiceMode = !this.isVoiceMode;
    if (this.isVoiceMode) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  startListening() {
    if (this.recognition) {
      this.currentMessageIsVocal = true;
      this.isListening = true;
      this.recognition.start();
    }
  }

  stopListening() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
      if (this.userInput.trim()) {
        this.sendMessage();
      }
    }
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
    const isVocalMode = this.currentMessageIsVocal;
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
        pdf_id: localStorage.getItem('currentPdfId'),
        vocalMode: isVocalMode
      }).subscribe({
        next: (response) => {
          let audioUrl: string | undefined = undefined;
          if (response.audio) {
            const audioBlob = this.base64ToBlob(response.audio, 'audio/mp3');
            audioUrl = URL.createObjectURL(audioBlob);
          }
          this.addBotMessage(response.answer, audioUrl);
          this.isLoading = false;
          this.currentMessageIsVocal = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.addBotMessage('Désolé, une erreur est survenue. Veuillez réessayer.');
          this.isLoading = false;
          this.currentMessageIsVocal = false;
        }
      });
    });
  }

  private base64ToBlob(base64: string, type: string): Blob {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  }

  private addUserMessage(text: string) {
    this.messages.push({ text, isUser: true });
    this.shouldScroll = true;
    this.cdr.detectChanges();
  }

  private addBotMessage(text: string, audioUrl?: string) {
    this.messages.push({ text, isUser: false, audioUrl });
    this.shouldScroll = true;
    this.cdr.detectChanges();
  }

  onAudioLoaded(event: Event, index: number) {
    if (index === this.messages.length - 1) {
      const audioElement = event.target as HTMLAudioElement;
      audioElement.play().catch(error => {
        console.error('Erreur lors de la lecture audio:', error);
      });
    }
  }
}