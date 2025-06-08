import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred while processing your request.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || errorMessage;
    }
    
    return throwError(() => ({ message: errorMessage, error }));
  }

  createBooking(booking: Booking): Observable<Booking> {
    console.log('Creating booking with data:', booking); // Debug log
    return this.http.post<Booking>(this.apiUrl, booking, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllBookings(status?: BookingStatus): Observable<Booking[]> {
    let url = this.apiUrl;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<Booking[]>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getBookingsByUserId(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/by-user/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getBookingsByBedId(bedId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/by-bed/${bedId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getPendingBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}?status=${BookingStatus.PENDING}`);
  }

  updateBooking(id: number, booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}`, booking, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  approveBooking(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/approve`, {
      status: BookingStatus.CONFIRMED
    }, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  rejectBooking(bookingId: number, reason?: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${bookingId}/reject`, {
      status: BookingStatus.DENIED,
      rejectionReason: reason
    }, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${bookingId}/cancel`, {});
  }

  completeBooking(bookingId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${bookingId}/complete`, {});
  }
}
