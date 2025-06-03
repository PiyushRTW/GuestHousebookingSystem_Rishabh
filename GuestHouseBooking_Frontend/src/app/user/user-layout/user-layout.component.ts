import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss']
})
export class UserLayoutComponent {
  isSidebarOpen = true;
  username = 'John Doe'; // This will be replaced with actual user data later

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    // Here you'll add actual logout logic with JWT later
    this.router.navigate(['/login']);
  }
}
