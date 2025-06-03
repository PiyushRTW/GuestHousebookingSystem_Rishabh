import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
    @ViewChild('drawer')
  drawer!: MatSidenav; // 'drawer' matches the #drawer in the template

  isScreenSmall: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Small)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  isSidebarOpen = true;
  adminName = 'Admin User'; // This will be replaced with actual admin data later

  constructor(private breakpointObserver: BreakpointObserver, private router: Router) {}
  // You could also move the toggle logic to the component class if needed
  toggleDrawer() {
    this.drawer.toggle();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    // Here you'll add actual logout logic with JWT later
    this.router.navigate(['/login']);
  }
}
