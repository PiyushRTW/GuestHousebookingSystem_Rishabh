import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingRequest } from '../../shared/interfaces/booking-request.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) { }

  // Get all pending booking requests
  getPendingBookings(): Observable<BookingRequest[]> {
    return this.http.get<BookingRequest[]>(`${this.apiUrl}?status=PENDING`);
  }

  // Approve a booking request
  approveBooking(bookingId: string): Observable<BookingRequest> {
    return this.http.put<BookingRequest>(`${this.apiUrl}/${bookingId}`, {
      status: 'CONFIRMED'
    });
  }

  // Reject a booking request
  rejectBooking(bookingId: string): Observable<BookingRequest> {
    return this.http.put<BookingRequest>(`${this.apiUrl}/${bookingId}`, {
      status: 'DENIED'
    });
  }
} 