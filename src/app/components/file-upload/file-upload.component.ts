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
  storage_url: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, NgxDropzoneModule, HttpClientModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="text-center mb-12">
          <h1 class="app-title text-4xl font-bold text-green-800 mb-2">Medisense</h1>
          <p class="app-subtitle text-lg text-green-600">Assistant intelligent d'analyse de documents médicaux</p>
        </div>
        
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <ngx-dropzone 
            (change)="onSelect($event)"
            [accept]="'application/pdf'"
            class="upload-zone border-2 border-dashed border-green-300 hover:border-green-500 transition-colors duration-300"
            [multiple]="false">
            <ngx-dropzone-label>
              <div class="flex flex-col items-center py-12">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <p class="text-xl font-semibold text-green-700 mb-2">Glissez votre fichier PDF ici</p>
                <p class="text-sm text-gray-500">ou cliquez pour sélectionner</p>
              </div>
            </ngx-dropzone-label>
          </ngx-dropzone>

          <div *ngIf="isUploading" class="mt-8">
            <div class="h-3 bg-green-100 rounded-full overflow-hidden">
              <div class="h-full bg-green-500 transition-all duration-300" [style.width.%]="uploadProgress"></div>
            </div>
            <p class="text-center mt-3 text-green-700 font-medium">
              Chargement en cours... {{uploadProgress}}%
            </p>
          </div>
        </div>

        <div *ngIf="documents.length > 0" class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-semibold text-green-800 mb-6">Documents précédents</h3>
          <div class="space-y-4">
            <div *ngFor="let file of documents" class="file-item group bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300">
              <div class="flex items-center justify-between p-6">
                <div class="flex items-center space-x-4 flex-1">
                  <div class="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <p class="font-medium text-gray-800 group-hover:text-green-700 transition-colors">{{file.filename}}</p>
                      <div class="flex items-center space-x-3">
                        <button 
                          (click)="viewFile(file.storage_url)" 
                          class="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-white"
                          title="Visualiser le document">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button 
                          (click)="openChat(file.pdf_id, file.storage_url)" 
                          class="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-white"
                          [disabled]="file.status !== 'completed'"
                          [title]="file.status === 'completed' ? 'Ouvrir le chat' : 'Document en cours de traitement'">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div class="flex items-center space-x-4 mt-2">
                      <span class="text-sm text-gray-600">
                        {{file.size | number:'1.0-0'}} Ko
                      </span>
                      <span class="text-sm text-gray-400">•</span>
                      <span class="text-sm text-gray-600">
                        {{file.upload_date | date:'dd/MM/yyyy HH:mm'}}
                      </span>
                      <span class="text-sm text-gray-400">•</span>
                      <span class="text-sm font-medium" [ngClass]="{
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
              <div *ngIf="file.error_message" class="px-6 pb-4">
                <p class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{file.error_message}}</p>
              </div>
            </div>
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

  openChat(pdfId: string, storageUrl: string) {
    localStorage.setItem('currentPdfId', pdfId);
    localStorage.setItem('storage_url', storageUrl);
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
                localStorage.setItem('storage_url', event.body.data.storage_url);
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

  viewFile(storageUrl: string) {
    window.open(storageUrl, '_blank');
  }
}