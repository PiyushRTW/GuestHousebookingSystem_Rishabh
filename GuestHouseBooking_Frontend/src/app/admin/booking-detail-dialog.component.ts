import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Booking } from '../shared/interfaces/Booking.interface';// Import the Booking interface

@Component({
  selector: 'app-booking-detail-dialog',
  templateUrl: './booking-detail-dialog.component.html',
  styleUrls: ['./booking-detail-dialog.component.scss']
})
export class BookingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BookingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Booking // Inject the booking data
  ) {}
}
