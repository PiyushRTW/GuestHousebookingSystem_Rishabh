import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';
import { Booking, BookingStatus } from '../../shared/models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.status === 401 || error.status === 403) {
      this.authService.logout();
    }
    return throwError(() => error);
  }

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getAllBookings(status?: BookingStatus): Observable<Booking[]> {
    let url = this.apiUrl;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<Booking[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUserBookings(status?: BookingStatus): Observable<Booking[]> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }

    let url = `${this.apiUrl}/by-user/${currentUser.id}`;
    if (status) {
      url += `?status=${status}`;
    }

    return this.http.get<Booking[]>(url, { headers: this.getHeaders() })
      .pipe(
        map(bookings => bookings || []),
        catchError(this.handleError.bind(this))
      );
  }

  getBookingsByBedId(bedId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/by-bed/${bedId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getPendingBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}?status=${BookingStatus.PENDING}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateBooking(id: number, booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, booking, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  approveBooking(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/approve`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  rejectBooking(bookingId: number, reason?: string): Observable<Booking> {
    const body = reason ? { rejectionReason: reason } : {};
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/reject`, body, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  cancelBooking(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/cancel`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  completeBooking(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/complete`, {}, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }
}
