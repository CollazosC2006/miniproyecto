import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync(), 
    MatDatepickerModule, 
    provideFirebaseApp(() => initializeApp({"projectId":"miniproyecto1-926e1","appId":"1:256627449972:web:31cea78b1a9a138c927121","storageBucket":"miniproyecto1-926e1.appspot.com","apiKey":"AIzaSyDyTrFgwz8hCN4jRrAm39VH9SoSyorq2Yg","authDomain":"miniproyecto1-926e1.firebaseapp.com","messagingSenderId":"256627449972","measurementId":"G-YJET67X350"})), 
    provideFirestore(() => getFirestore())
  ]
};
