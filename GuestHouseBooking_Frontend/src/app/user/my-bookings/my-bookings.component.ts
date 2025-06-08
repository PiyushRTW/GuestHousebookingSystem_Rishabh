import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from 'src/app/services/bookings/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Booking, BookingStatus } from 'src/app/shared/models/booking.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  userBookings: Booking[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserBookings() {
    this.isLoading = true;
    this.error = null;

    this.bookingService.getUserBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.userBookings = bookings;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
          if (error.message !== 'No bookings found') {
            this.snackBar.open(error.message, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
          }
        }
      });
  }

  cancelBooking(bookingId: number) {
    this.bookingService.cancelBooking(bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Booking cancelled successfully', 'Close', {
            duration: 3000
          });
          this.loadUserBookings();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error cancelling booking', 'Close', {
            duration: 3000
          });
        }
      });
  }

  getStatusClass(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'status-confirmed';
      case BookingStatus.PENDING:
        return 'status-pending';
      case BookingStatus.CANCELED:
        return 'status-cancelled';
      case BookingStatus.COMPLETED:
        return 'status-completed';
      case BookingStatus.DENIED:
        return 'status-denied';
      default:
        return '';
    }
  }

  getStatusIcon(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'check_circle';
      case BookingStatus.PENDING:
        return 'pending';
      case BookingStatus.CANCELED:
        return 'cancel';
      case BookingStatus.COMPLETED:
        return 'task_alt';
      case BookingStatus.DENIED:
        return 'block';
      default:
        return 'help';
    }
  }

  makeNewBooking() {
    this.router.navigate(['/user/hotels']);
  }
}