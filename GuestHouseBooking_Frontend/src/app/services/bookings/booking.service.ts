import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BookingDTO {
  id?: number;
  userId: number;
  bedId: number;
  checkInDate: Date;
  checkOutDate: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED' | 'DENIED';
  totalPrice: number;
  specialRequests?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) { }

  createBooking(booking: BookingDTO): Observable<BookingDTO> {
    return this.http.post<BookingDTO>(this.apiUrl, booking);
  }

  getBookingById(id: number): Observable<BookingDTO> {
    return this.http.get<BookingDTO>(`${this.apiUrl}/${id}`);
  }

  getAllBookings(): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(this.apiUrl);
  }

  getBookingsByUserId(userId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.apiUrl}/by-user/${userId}`);
  }

  getBookingsByBedId(bedId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.apiUrl}/by-bed/${bedId}`);
  }

  updateBooking(id: number, booking: BookingDTO): Observable<BookingDTO> {
    return this.http.put<BookingDTO>(`${this.apiUrl}/${id}`, booking);
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
