import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

export interface UploadedFile {
  name: string;
  size: number;
  date: Date;
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

      <div *ngIf="previousFiles.length > 0" class="file-list">
        <h3 class="text-lg font-medium text-gray-700 mb-3">Documents précédents</h3>
        <div *ngFor="let file of previousFiles" class="file-item">
          <div class="flex items-center space-x-3">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <div>
              <p class="font-medium text-gray-700">{{file.name}}</p>
              <p class="text-sm text-gray-500">
                {{file.size | number:'1.0-0'}} Ko • {{file.date | date:'dd/MM/yyyy HH:mm'}}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FileUploadComponent {
  @Input() previousFiles: UploadedFile[] = [];
  @Output() fileUploaded = new EventEmitter<void>();

  isUploading = false;
  uploadProgress = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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
            if (event.type === 1) { // UploadProgress
              this.uploadProgress = Math.round((event.loaded / event.total) * 100);
            } else if (event.type === 4) { // Response
              this.isUploading = false;
              this.fileUploaded.emit();
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