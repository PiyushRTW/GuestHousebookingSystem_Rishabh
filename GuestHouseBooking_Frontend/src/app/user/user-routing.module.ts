import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { HotelsComponent } from './hotels/hotels.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { UserDetailsComponent } from './user-details/user-details.component';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: 'hotels', component: HotelsComponent },
      { path: 'my-bookings', component: MyBookingsComponent },
      { path: 'user-details', component: UserDetailsComponent },
      // Remove this direct route to booking page:
      { path: 'hotel/:hotelId/booking', component: BookingPageComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default user route is Dashboard
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }