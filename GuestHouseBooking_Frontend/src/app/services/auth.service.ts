import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap, finalize, switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private tokenRefreshTimeout: any;
  redirectUrl: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
    this.setupTokenRefresh();
  }

  private setupTokenRefresh(): void {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        const tokenExp = this.jwtHelper.getTokenExpirationDate(token);
        if (tokenExp) {
          const timeToExpiry = tokenExp.getTime() - Date.now();
          const refreshTime = timeToExpiry * 0.75; // Refresh at 75% of token lifetime
          this.scheduleTokenRefresh(refreshTime);
        }
      }
    }
  }

  private scheduleTokenRefresh(delay: number): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
    this.tokenRefreshTimeout = setTimeout(() => {
      if (this.isAuthenticated()) {
        this.refreshToken().subscribe();
      }
    }, delay);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response && response.token) {
            this.storeTokenAndUser(response);
            this.setupTokenRefresh();
          }
        }),
        map(response => {
          console.log('Navigating user with role:', response.role);
          if (this.redirectUrl) {
            console.log('Redirecting to:', this.redirectUrl);
            this.router.navigate([this.redirectUrl]);
            this.redirectUrl = null;
          } else {
            const targetRoute = response.role === 'ADMIN' ? '/admin/dashboard' : '/user/hotels';
            console.log('Navigating to:', targetRoute);
            this.router.navigate([targetRoute]).then(
              success => console.log('Navigation result:', success),
              error => console.error('Navigation error:', error)
            );
          }
          return response;
        }),
        catchError(error => {
          console.error('Auth service error:', error);
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<string> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.asObservable().pipe(
        switchMap(token => {
          if (token) {
            return of(token);
          }
          return throwError(() => new Error('Refresh token failed'));
        })
      );
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
          this.setupTokenRefresh(); // Schedule next refresh
        }
      }),
      map(response => response.token),
      catchError(error => {
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(null);
        if (error.status === 401 || error.status === 403) {
          this.logout();
          this.snackBar.open('Session expired. Please login again.', 'Close', {
            duration: 5000
          });
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
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
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
      const isExpired = this.jwtHelper.isTokenExpired(token);
      if (isExpired) {
        this.clearAuthData();
        return false;
      }
      return true;
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
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
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
    
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000
    });
    
    return throwError(() => new Error(errorMessage));
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  get userRole(): string | null {
    const user = this.getUserFromStorage();
    return user ? user.role : null;
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }
}