import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface ChatMessage {
  sender: 'user' | 'assistant';
  content: string;
}

interface Document {
  name: string;
  size: number;
  url: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: false,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userId: string = '';
  activeTab: 'assistant' | 'documents' = 'assistant';
  chatMessages: ChatMessage[] = [];
  newMessage: string = '';
  documents: Document[] = [];
  selectedFile: File | null = null;
  isUploading: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const storedId = this.authService.getStoredUserId();
    this.userId = storedId || '';
  }

  signOut() {
    this.authService.signOut();
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatMessages.push({
        sender: 'user',
        content: this.newMessage
      });

      setTimeout(() => {
        this.chatMessages.push({
          sender: 'assistant',
          content: 'Je suis votre assistant médical. Comment puis-je vous aider ?'
        });
      }, 1000);

      this.newMessage = '';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
        this.selectedFile = file;
      } else {
        alert('Veuillez sélectionner un fichier PDF de moins de 10MB');
      }
    }
  }

  cancelUpload() {
    this.selectedFile = null;
    const input = document.getElementById('file-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  confirmUpload() {
    if (this.selectedFile) {
      this.isUploading = true;
      
      setTimeout(() => {
        this.documents.push({
          name: this.selectedFile!.name,
          size: Math.round(this.selectedFile!.size / 1024 / 1024),
          url: URL.createObjectURL(this.selectedFile!)
        });
        
        this.isUploading = false;
        this.selectedFile = null;
        
        const input = document.getElementById('file-upload') as HTMLInputElement;
        if (input) {
          input.value = '';
        }
      }, 2000);
    }
  }

  deleteDocument(index: number) {
    this.documents.splice(index, 1);
  }
} 