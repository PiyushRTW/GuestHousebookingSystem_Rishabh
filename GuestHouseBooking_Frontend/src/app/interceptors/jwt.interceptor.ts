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

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip for login and refresh endpoints
    if (request.url.includes('/api/auth/login') || request.url.includes('/api/auth/refresh')) {
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
        if ([401, 403].includes(error.status)) {
          // Token might be expired or invalid
          if (!this.isRefreshing) {
            return this.handleExpiredToken(request, next);
          } else {
            // Wait for token refresh to complete
            return this.refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap(token => {
                return next.handle(this.addTokenToRequest(request, token));
              }),
              catchError(refreshError => {
                // If refresh fails, logout and redirect
                this.authService.logout();
                this.router.navigate(['/login']);
                return throwError(() => refreshError);
              })
            );
          }
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private handleExpiredToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: string) => {
          this.refreshTokenSubject.next(token);
          return next.handle(this.addTokenToRequest(request, token));
        }),
        catchError((error) => {
          // If refresh fails, clear everything and redirect to login
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }
    
    // If refresh is already in progress, wait for it to complete
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenToRequest(request, token)))
    );
  }
} 