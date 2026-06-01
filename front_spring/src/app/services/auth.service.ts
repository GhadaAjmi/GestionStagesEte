import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';

interface LoginRequest {
  email: string;
  motDePasse: string;
}

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  sub: string;
  id: number;
  role: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8087/api/auth';


  private profileUpdatedSubject = new BehaviorSubject<void>(undefined);
  public profileUpdated$ = this.profileUpdatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  // LOGIN
  login(email: string, motDePasse: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, motDePasse} as LoginRequest
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  // GET CURRENT USER
  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      catchError(() => of(null))
    );
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('token');
  }

  // TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  // JWT DECODE
  private decodeToken(): JwtPayload | null {
    const token = this.getToken();
    console.log("decodin token",token)
    if (!token) return null;

    try {
      const payload = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      return JSON.parse(atob(payload)) as JwtPayload;
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    return this.decodeToken()?.id ?? null;
  }

  getUserRole(): string | null {
    return this.decodeToken()?.role ?? null;
  }

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded) return true;
    return decoded.exp * 1000 < Date.now();
  }

  // Notifier les changements de profil
  notifyProfileUpdate(): void {
    this.profileUpdatedSubject.next();
  }
}