import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { HotelsComponent } from './hotels/hotels.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'hotels', pathMatch: 'full' },
      { path: 'hotels', component: HotelsComponent },
      { path: 'booking/:id', component: BookingPageComponent },
      { path: 'my-bookings', component: MyBookingsComponent },
      { path: 'profile', component: UserDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }