import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

export interface UploadedFile {
  id: string;
  filename: string;
  upload_date: string;
  size: number;
  status: string;
  chunks_count: number;
  pdf_id: string;
  error_message: string | null;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, NgxDropzoneModule, HttpClientModule],
  template: `
    <div class="upload-container">
      <h1 class="app-title">Medisense</h1>
      <p class="app-subtitle">Assistant intelligent d'analyse de documents médicaux</p>
      
      <ngx-dropzone 
        (change)="onSelect($event)"
        [accept]="'application/pdf'"
        class="upload-zone"
        [multiple]="false">
        <ngx-dropzone-label>
          <div class="flex flex-col items-center">
            <svg class="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p class="text-lg text-green-700 font-medium mb-2">Glissez votre fichier PDF ici</p>
            <p class="text-sm text-gray-500">ou cliquez pour sélectionner</p>
          </div>
        </ngx-dropzone-label>
      </ngx-dropzone>

      <div *ngIf="isUploading" class="mt-8">
        <div class="progress-bar">
          <div class="progress-bar-fill" [style.width.%]="uploadProgress"></div>
        </div>
        <p class="text-center mt-2 text-green-700 font-medium">
          Chargement en cours... {{uploadProgress}}%
        </p>
      </div>

      <div *ngIf="documents.length > 0" class="file-list">
        <h3 class="text-lg font-medium text-gray-700 mb-4">Documents précédents</h3>
        <div *ngFor="let file of documents" class="file-item group">
          <div class="flex items-center justify-between p-4">
            <div class="flex items-center space-x-4 flex-1">
              <div class="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="font-medium text-gray-800 group-hover:text-green-600 transition-colors">{{file.filename}}</p>
                  <div class="flex items-center space-x-3">
                    <button 
                      (click)="openChat(file.pdf_id)" 
                      class="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                      [disabled]="file.status !== 'completed'"
                      [title]="file.status === 'completed' ? 'Ouvrir le chat' : 'Document en cours de traitement'">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="flex items-center space-x-4 mt-1">
                  <span class="text-sm text-gray-500">
                    {{file.size | number:'1.0-0'}} Ko
                  </span>
                  <span class="text-sm text-gray-500">•</span>
                  <span class="text-sm text-gray-500">
                    {{file.upload_date | date:'dd/MM/yyyy HH:mm'}}
                  </span>
                  <span class="text-sm text-gray-500">•</span>
                  <span class="text-sm" [ngClass]="{
                    'text-green-600': file.status === 'completed',
                    'text-yellow-600': file.status === 'processing',
                    'text-red-600': file.status === 'error'
                  }">
                    {{file.status === 'completed' ? 'Terminé' : 
                      file.status === 'processing' ? 'En cours' : 
                      file.status === 'error' ? 'Erreur' : file.status}}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="file.error_message" class="px-4 pb-4">
            <p class="text-sm text-red-600">{{file.error_message}}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FileUploadComponent implements OnInit {
  @Input() previousFiles: UploadedFile[] = [];
  @Output() fileUploaded = new EventEmitter<void>();

  isUploading = false;
  uploadProgress = 0;
  documents: UploadedFile[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  private loadDocuments() {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.http.get<{status: string, documents: UploadedFile[]}>(`${environment.apiUrl}/documents/${user.uid}`)
          .subscribe({
            next: (response) => {
              if (response.status === 'success') {
                this.documents = response.documents;
              }
            },
            error: (error) => {
              console.error('Erreur lors du chargement des documents:', error);
            }
          });
      }
    });
  }

  openChat(pdfId: string) {
    localStorage.setItem('currentPdfId', pdfId);
    this.fileUploaded.emit();
  }

  onSelect(event: any) {
    const file = event.addedFiles[0];
    if (file) {
      this.isUploading = true;
      this.uploadProgress = 0;

      this.authService.user$.pipe(take(1)).subscribe(user => {
        if (!user) {
          console.error('Utilisateur non connecté');
          this.isUploading = false;
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', user.uid);

        this.http.post(`${environment.apiUrl}/analyze`, formData, {
          reportProgress: true,
          observe: 'events'
        }).subscribe({
          next: (event: any) => {
            if (event.type === 1) {
              this.uploadProgress = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === 4) { 
              this.isUploading = false;
              console.log(event.body);
              if (event.body && event.body.data && event.body.data.pdf_id) {
                localStorage.setItem('currentPdfId', event.body.data.pdf_id);
              }
              this.fileUploaded.emit();
              this.loadDocuments();
            }
          },
          error: (error) => {
            console.error('Upload failed:', error);
            this.isUploading = false;
          }
        });
      });
    }
  }
}