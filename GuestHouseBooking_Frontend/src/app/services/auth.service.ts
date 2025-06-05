import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  username: string;
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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.storeTokenAndUser(response);
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<string> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.asObservable();
    }

    this.refreshTokenInProgress = true;

    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    }).pipe(
      tap(response => {
        this.storeToken(response.token);
        this.refreshTokenSubject.next(response.token);
      }),
      map(response => response.token),
      catchError(error => {
        this.refreshTokenInProgress = false;
        if (error.status === 401 || error.status === 403) {
          this.logout();
        }
        return throwError(() => error);
      }),
      tap(() => {
        this.refreshTokenInProgress = false;
      })
    );
  }

  private storeTokenAndUser(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    const user = {
      id: response.id,
      username: response.username,
      role: response.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
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
        })
      ).subscribe(() => {
        this.handleLogout();
      });
    } else {
      this.handleLogout();
    }
  }

  private handleLogout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    if (error.status === 401) {
      return throwError(() => new Error('Invalid username or password'));
    }
    return throwError(() => error);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }

  get userRole(): string | null {
    const user = this.getUserFromStorage();
    return user ? user.role : null;
  }

  private getUserFromStorage(): any {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }
}