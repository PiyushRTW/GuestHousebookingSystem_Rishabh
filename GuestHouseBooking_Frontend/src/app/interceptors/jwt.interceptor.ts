import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip for login, register and refresh endpoints
    if (request.url.includes('/api/auth/login') || 
        request.url.includes('/api/auth/register') || 
        request.url.includes('/api/auth/refresh')) {
      return next.handle(request);
    }

    // Only add auth header for API requests
    if (!request.url.startsWith(environment.apiUrl)) {
      return next.handle(request);
    }

    const token = this.authService.getToken();
    
    if (token) {
      // Check if token is expired before making the request
      if (this.authService.isTokenExpired()) {
        return this.handleExpiredToken(request, next);
      }

      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        if (error.status === 403) {
          this.snackBar.open('Session expired. Please login again.', 'Close', {
            duration: 5000
          });
          this.authService.logout();
          return throwError(() => error);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addTokenToRequest(request, token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          this.snackBar.open('Session expired. Please login again.', 'Close', {
            duration: 5000
          });
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }
    
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenToRequest(request, token)))
    );
  }

  private handleExpiredToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap((token: string) => {
        return next.handle(this.addTokenToRequest(request, token));
      }),
      catchError((error) => {
        this.authService.logout();
        this.snackBar.open('Session expired. Please login again.', 'Close', {
          duration: 5000
        });
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
} 