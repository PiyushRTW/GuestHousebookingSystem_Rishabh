import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!this.authService.isAuthenticated()) {
      // Store the attempted URL for redirecting
      this.authService.redirectUrl = state.url;
      this.router.navigate(['/login']);
      return false;
    }

    // Check if token is about to expire (within 5 minutes)
    const token = this.authService.getToken();
    if (token) {
      const tokenExp = new Date(JSON.parse(atob(token.split('.')[1])).exp * 1000);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;

      if (tokenExp.getTime() - now.getTime() < fiveMinutes) {
        // Token is about to expire, try to refresh
        return this.authService.refreshToken().pipe(
          map(() => true),
          catchError(() => {
            this.authService.redirectUrl = state.url;
            this.router.navigate(['/login']);
            return of(false);
          })
        );
      }
    }

    // Check role-based access if required
    if (route.data['roles'] && !this.checkRoles(route.data['roles'])) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }

  private checkRoles(roles: string[]): boolean {
    const userRole = this.authService.userRole;
    return userRole ? roles.includes(userRole) : false;
  }
}