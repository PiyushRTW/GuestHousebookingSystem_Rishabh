import { Component, OnInit } from '@angular/core';
import { BookingService } from 'src/app/services/bookings/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Booking, BookingStatus } from 'src/app/shared/models/booking.model';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss']
})
export class GuestsComponent implements OnInit {
  bookingRequests: Booking[] = [];
  displayedColumns: string[] = [
    'id',
    'guestName',
    'guestHouseName',
    'roomNumber',
    'checkInDate',
    'checkOutDate',
    'status',
    'createdAt',
    'actions'
  ];
  isLoading: boolean = true;

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBookingRequests();
  }

  loadBookingRequests() {
    this.isLoading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        // Filter only PENDING bookings
        this.bookingRequests = bookings.filter(b => b.status === BookingStatus.PENDING);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading booking requests:', error);
        this.snackBar.open('Error loading booking requests. Please try again.', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  approveRequest(bookingId: number) {
    this.bookingService.approveBooking(bookingId).subscribe({
      next: () => {
        this.snackBar.open('Booking request approved successfully', 'Close', {
          duration: 3000
        });
        this.loadBookingRequests();
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.snackBar.open('Error approving request. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  rejectRequest(bookingId: number) {
    this.bookingService.rejectBooking(bookingId).subscribe({
      next: () => {
        this.snackBar.open('Booking request rejected successfully', 'Close', {
          duration: 3000
        });
        this.loadBookingRequests();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.snackBar.open('Error rejecting request. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'status-pending';
      case BookingStatus.CONFIRMED:
        return 'status-approved';
      case BookingStatus.DENIED:
        return 'status-rejected';
      default:
        return '';
    }
  }
}