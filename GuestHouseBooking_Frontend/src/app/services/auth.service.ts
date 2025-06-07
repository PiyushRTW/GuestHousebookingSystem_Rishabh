import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  id: number;
}

interface TokenResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private jwtHelper = new JwtHelperService();
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.storeTokenAndUser(response);
          }
        }),
        map(response => {
          // After successful login, check if there's a redirect URL
          if (this.redirectUrl) {
            this.router.navigate([this.redirectUrl]);
            this.redirectUrl = null;
          } else {
            // Default navigation based on role
            if (response.role === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/user/dashboard']);
            }
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<string> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.asObservable();
    }

    this.refreshTokenInProgress = true;
    const currentToken = this.getToken();

    if (!currentToken) {
      this.refreshTokenInProgress = false;
      return throwError(() => new Error('No token available for refresh'));
    }

    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    }).pipe(
      tap(response => {
        if (response && response.token) {
          this.storeToken(response.token);
          this.refreshTokenSubject.next(response.token);
        }
      }),
      map(response => response.token),
      catchError(error => {
        this.refreshTokenInProgress = false;
        if (error.status === 401 || error.status === 403) {
          this.logout();
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshTokenInProgress = false;
      })
    );
  }

  private storeTokenAndUser(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    const user = {
      id: response.id,
      username: response.username,
      email: response.email,
      role: response.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getUserFromStorage(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).pipe(
        catchError(error => {
          console.error('Logout error:', error);
          return of(null);
        }),
        finalize(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        })
      ).subscribe();
    } else {
      this.clearAuthData();
      this.router.navigate(['/login']);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.refreshTokenSubject.next(null);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred during authentication.';
    
    if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    return !token || this.jwtHelper.isTokenExpired(token);
  }

  get userRole(): string | null {
    const user = this.getUserFromStorage();
    return user ? user.role : null;
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }
}