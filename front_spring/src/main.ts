(window as any).global = window;  

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

// Modules Angular classiques
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserAnimationsModule,
      HttpClientModule,
      ReactiveFormsModule
    ),
    provideHttpClient(withInterceptorsFromDi()) 
  ]
});
