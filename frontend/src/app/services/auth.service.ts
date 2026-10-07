import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private apiUrl = 'http://localhost:3000/api/auth';

  public currentUser = signal<User | null>(this.getUserFromStorage());
  public isAuthenticated = signal<boolean>(!!this.getToken());

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (this.isBrowser) {
          localStorage.setItem('presuapp_token', res.token);
          localStorage.setItem('presuapp_user', JSON.stringify(res.user));
        }
        this.currentUser.set(res.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('presuapp_token');
      localStorage.removeItem('presuapp_user');
      localStorage.removeItem('token');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('presuapp_token');
    }
    return null;
  }

  private getUserFromStorage(): User | null {
    if (this.isBrowser) {
      const user = localStorage.getItem('presuapp_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}