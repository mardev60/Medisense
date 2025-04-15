import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

export interface Message {
  content: string;
  isUser: boolean;
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
          {{message.content}}
        </div>
      </div>

      <div class="border-t p-4 bg-white rounded-b-2xl">
        <div class="flex gap-3">
          <input type="text" 
                 [(ngModel)]="currentMessage" 
                 (keyup.enter)="sendMessage()"
                 placeholder="Posez votre question sur le document..."
                 class="chat-input">
          <button (click)="sendMessage()" 
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
export class ChatComponent {
  @Input() messages: Message[] = [];
  @Output() goBack = new EventEmitter<void>();

  currentMessage = '';

  constructor(private chatService: ChatService) {}

  sendMessage() {
    if (this.currentMessage.trim()) {
      this.messages.push({
        content: this.currentMessage,
        isUser: true
      });

      this.chatService.simulateResponse(this.currentMessage).subscribe(response => {
        this.messages.push({
          content: response,
          isUser: false
        });
      });

      this.currentMessage = '';
    }
  }
}