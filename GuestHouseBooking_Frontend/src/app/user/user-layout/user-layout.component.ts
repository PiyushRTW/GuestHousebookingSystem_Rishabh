import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss']
})
export class UserLayoutComponent {
  isSidebarOpen = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  get username(): string {
    const user = this.authService.currentUserValue;
    return user ? `${user.firstName} ${user.lastName}` : 'Guest';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
  }
}
