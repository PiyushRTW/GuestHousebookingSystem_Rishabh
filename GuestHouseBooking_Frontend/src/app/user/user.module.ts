import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { LoginComponent } from './login/login.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { MyBookingsComponent } from './my-bookings/my-bookings.component'; // Import
import { UserDetailsComponent } from './user-details/user-details.component'; // Import
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav'; // Import
import { MatListModule } from '@angular/material/list'; // Import
import { MatIconModule } from '@angular/material/icon';
import { HotelsComponent } from './hotels/hotels.component'; // Import
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    UserComponent,
    UserLayoutComponent,
    LoginComponent,
    BookingPageComponent,
    HotelsComponent, // Declare
    MyBookingsComponent, // Declare
    UserDetailsComponent, HotelsComponent // Declare
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSnackBarModule,
    MatSidenavModule, // Import
    MatListModule, // Import
    MatIconModule, // Import
    MatProgressSpinnerModule,
  ]
})
export class UserModule { }