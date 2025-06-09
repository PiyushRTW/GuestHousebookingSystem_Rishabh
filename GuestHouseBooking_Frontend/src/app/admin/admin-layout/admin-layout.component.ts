import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;

  isScreenSmall$: Observable<boolean>;
  isSidebarOpen = true;
  adminPhotoUrl = 'assets/my_photo.jpg';
  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private authService: AuthService
  ) {
    this.isScreenSmall$ = this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(
        map(result => result.matches),
        shareReplay(1)
      );
  }

  ngOnInit() {
    // Auto close sidebar on mobile when screen size changes
    this.isScreenSmall$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isSmall => {
      if (isSmall) {
        this.isSidebarOpen = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get adminName(): string {
    return 'Piyush Rathwa';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }

  openSidebar() {
    if (!this.isSidebarOpen) {
      this.isSidebarOpen = true;
    }
  }

  onNavItemClick() {
    // Close sidebar on navigation in mobile view
    this.isScreenSmall$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isSmall => {
      if (isSmall) {
        this.closeSidebar();
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
