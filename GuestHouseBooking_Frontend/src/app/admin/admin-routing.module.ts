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

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'guests', component: GuestsComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: 'hotels', component:  HotelsComponent},
      { path: 'admin-booking', component: AdminBookingComponent },
      { path: 'reservations-list', component: ReservationsListComponent },
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
