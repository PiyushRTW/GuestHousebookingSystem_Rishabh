import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Booking } from '../shared/models/booking.model';

@Component({
  selector: 'app-booking-detail-dialog',
  templateUrl: './booking-detail-dialog.component.html',
  styleUrls: ['./booking-detail-dialog.component.scss']
})
export class BookingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BookingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Booking
  ) {}

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'check_circle';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'cancel';
      case 'COMPLETED':
        return 'task_alt';
      case 'DENIED':
        return 'block';
      default:
        return 'info';
    }
  }
}
