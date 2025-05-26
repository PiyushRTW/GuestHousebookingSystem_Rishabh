import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HotelsComponent } from './hotels/hotels.component';
import { GuestsComponent } from './guests/guests.component';
import { RoomsComponent } from './rooms/rooms.component';
import { MatTableModule } from '@angular/material/table'; // Import MatTableModule
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import MatProgressSpinnerModule
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddEditHotelDialogComponent } from './hotels/add-edit-hotel-dialog/add-edit-hotel-dialog.component';
import { MatDialogModule } from '@angular/material/dialog'; // Import MatDialogModule
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule
import { MatInputModule } from '@angular/material/input'; // Import MatInputModule
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { MatSelectModule } from '@angular/material/select'; // Import if you add select fields
import { MatDatepickerModule } from '@angular/material/datepicker'; // <-- Add this!
import { MatNativeDateModule } from '@angular/material/core';
import { AdminBookingComponent } from './admin-booking/admin-booking.component'; 
import { MatPaginatorModule } from '@angular/material/paginator'; // <-- Add this
import { MatSortModule } from '@angular/material/sort'; 
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { BookingDetailDialogComponent } from './booking-detail-dialog.component';
import { ReservationsListComponent } from './reservations-list/reservations-list.component';

@NgModule({
  declarations: [
    AdminComponent,
    AdminLayoutComponent,
    DashboardComponent,
    HotelsComponent,
    GuestsComponent,
    RoomsComponent,
    AddEditHotelDialogComponent,
    AdminBookingComponent,
    ReservationsListComponent, // <-- Declare it
    BookingDetailDialogComponent,
  
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule, // Add this
    MatSortModule
  ]
})
export class AdminModule { }