import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDDY2kpw9laI8Q_NOvB3QzVKInUNPylhWQ",
  authDomain: "medisense-8ca26.firebaseapp.com",
  projectId: "medisense-8ca26",
  storageBucket: "medisense-8ca26.firebasestorage.app",
  messagingSenderId: "620931142287",
  appId: "1:620931142287:web:b6519d217427c9ea2656fa"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};