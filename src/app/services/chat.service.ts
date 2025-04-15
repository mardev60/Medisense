import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  simulateResponse(message: string): Observable<string> {
    // Simuler une réponse de l'IA
    return of('Je suis un assistant IA. Je peux vous aider à comprendre votre document médical.').pipe(
      delay(1000)
    );
  }

  simulateFileUpload(file: File): Observable<boolean> {
    // Simuler l'upload du fichier
    return of(true).pipe(delay(2000));
  }
}