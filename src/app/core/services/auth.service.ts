import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: User;
  message?: string;
  access_token?: string; // Pour Laravel Sanctum
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.checkAuth();
  }

  /**
   * Récupère le cookie CSRF avant l'authentification
   */
   getCsrfCookie(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sanctum/csrf-cookie`, { 
      withCredentials: true 
    });
  }

  /**
   * Inscription utilisateur
   */
  register(name: string, email: string, password: string, passwordConfirmation: string): Observable<any> {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        return this.http.post<any>(`${this.apiUrl}/register`, {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation
        }, { 
          withCredentials: true 
        });
      }),
      tap(response => {
        this.handleAuthSuccess(response);
      })
    );
  }

  /**
   * Connexion utilisateur
   */
  login(email: string, password: string): Observable<any> {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        return this.http.post<any>(`${this.apiUrl}/login`, {
          email,
          password
        }, { 
          withCredentials: true 
        });
      }),
      tap(response => {
        this.handleAuthSuccess(response);
      })
    );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        this.handleLogout();
      })
    );
  }

  /**
   * Gestion de la réussite de l'authentification
   */
  private handleAuthSuccess(response: any): void {
    // Pour Laravel Sanctum, le token est généralement dans access_token
    const token = response.access_token || response.token;
    
    if (token) {
      // Stocker le token (optionnel avec Sanctum, mais utile pour les headers)
      localStorage.setItem('auth_token', token);
      
      // Stocker les infos utilisateur
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }
      
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Gestion de la déconnexion
   */
  private handleLogout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Vérification de l'authentification au démarrage
   */
  private checkAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(user);
      
      // Optionnel: Vérifier la validité du token avec une requête API
      this.validateToken().subscribe({
        error: () => this.handleLogout()
      });
    }
  }

  /**
   * Validation du token avec le backend
   */
  private validateToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { 
      withCredentials: true 
    }).pipe(
      tap((user: any) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Chargement de l'utilisateur depuis le localStorage
   */
  private getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Récupération du token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Vérification de l'état de connexion
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Récupération de l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Rafraîchissement des données utilisateur
   */
  refreshUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { 
      withCredentials: true 
    }).pipe(
      tap((user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }
}