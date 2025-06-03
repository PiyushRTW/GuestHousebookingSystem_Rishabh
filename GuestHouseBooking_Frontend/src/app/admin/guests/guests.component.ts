import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking/booking.service';
import { BookingRequest } from '../../shared/interfaces/booking-request.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss']
})
export class GuestsComponent implements OnInit {
  bookingRequests: BookingRequest[] = [];
  displayedColumns: string[] = [
    'requestId',
    'guestName',
    'hotelName',
    'roomName',
    'arrivalDate',
    'departureDate',
    'numberOfGuests',
    'requestDate',
    'status',
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
    this.bookingService.getPendingBookings().subscribe({
      next: (requests) => {
        this.bookingRequests = requests;
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

  approveRequest(requestId: string) {
    this.bookingService.approveBooking(requestId).subscribe({
      next: () => {
        this.snackBar.open('Booking request approved successfully', 'Close', {
          duration: 3000
        });
        this.loadBookingRequests(); // Reload the list
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.snackBar.open('Error approving request. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  rejectRequest(requestId: string) {
    this.bookingService.rejectBooking(requestId).subscribe({
      next: () => {
        this.snackBar.open('Booking request rejected successfully', 'Close', {
          duration: 3000
        });
        this.loadBookingRequests(); // Reload the list
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.snackBar.open('Error rejecting request. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  getStatusClass(status: 'Pending' | 'Approved' | 'Rejected') {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }
}