import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      // Check if user has required role
      const requiredRole = route.data['role'];
      if (requiredRole) {
        const userRole = this.authService.userRole;
        if (userRole !== requiredRole) {
          this.snackBar.open('You do not have permission to access this page', 'Close', {
            duration: 5000
          });
          this.router.navigate(['/']);
          return false;
        }
      }
      return true;
    }

    // Store attempted URL for redirecting
    this.authService.redirectUrl = state.url;
    
    this.snackBar.open('Please log in to continue', 'Close', {
      duration: 5000
    });
    
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
} 