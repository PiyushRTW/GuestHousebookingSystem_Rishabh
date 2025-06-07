import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component'; // Create these later
import { GuestsComponent } from './guests/guests.component';
import { RoomsComponent } from './rooms/rooms.component';
import { HotelsComponent } from './hotels/hotels.component';
import { AdminBookingComponent } from './admin-booking/admin-booking.component';
import { ReservationsListComponent } from './reservations-list/reservations-list.component';
import { BedConfigurationComponent } from './rooms/bed-configuration/bed-configuration.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' },
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      { 
        path: 'guests', 
        component: GuestsComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      { 
        path: 'rooms', 
        component: RoomsComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      { 
        path: 'rooms/bed-configuration', 
        component: BedConfigurationComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      { 
        path: 'hotels', 
        component: HotelsComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      { 
        path: 'admin-booking', 
        component: AdminBookingComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      { 
        path: 'reservations-list', 
        component: ReservationsListComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // Default admin route
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
