import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from 'src/app/services/bookings/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Booking, BookingStatus } from 'src/app/shared/models/booking.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss']
})
export class GuestsComponent implements OnInit, OnDestroy {
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
  private subscriptions: Subscription = new Subscription();

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBookingRequests();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadBookingRequests() {
    this.isLoading = true;
    const subscription = this.bookingService.getAllBookings()
      .pipe(
        tap((bookings: Booking[]) => {
          this.bookingRequests = bookings.filter(b => b.status === BookingStatus.PENDING);
          this.isLoading = false;
          if (this.bookingRequests.length === 0) {
            this.snackBar.open('No pending booking requests found.', 'Close', {
              duration: 3000
            });
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error loading booking requests:', error);
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
            this.snackBar.open('Session expired. Please login again.', 'Close', {
              duration: 3000
            });
          } else {
            this.snackBar.open('Error loading booking requests. Please try again.', 'Close', {
              duration: 3000
            });
          }
          this.isLoading = false;
          throw error;
        })
      )
      .subscribe();

    this.subscriptions.add(subscription);
  }

  approveRequest(bookingId: number) {
    const subscription = this.bookingService.approveBooking(bookingId)
      .pipe(
        tap(() => {
          this.snackBar.open('Booking request approved successfully', 'Close', {
            duration: 3000
          });
          this.loadBookingRequests();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error approving request:', error);
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
            this.snackBar.open('Session expired. Please login again.', 'Close', {
              duration: 3000
            });
          } else {
            this.snackBar.open('Error approving request. Please try again.', 'Close', {
              duration: 3000
            });
          }
          throw error;
        })
      )
      .subscribe();

    this.subscriptions.add(subscription);
  }

  rejectRequest(bookingId: number) {
    const subscription = this.bookingService.rejectBooking(bookingId)
      .pipe(
        tap(() => {
          this.snackBar.open('Booking request rejected successfully', 'Close', {
            duration: 3000
          });
          this.loadBookingRequests();
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error rejecting request:', error);
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
            this.snackBar.open('Session expired. Please login again.', 'Close', {
              duration: 3000
            });
          } else {
            this.snackBar.open('Error rejecting request. Please try again.', 'Close', {
              duration: 3000
            });
          }
          throw error;
        })
      )
      .subscribe();

    this.subscriptions.add(subscription);
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