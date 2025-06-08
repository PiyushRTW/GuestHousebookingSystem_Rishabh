import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';
import { GuestHouse } from '../../shared/models/guesthouse.model';

@Injectable({
  providedIn: 'root'
})
export class GuestHouseService {
  private apiUrl = `${environment.apiUrl}/guesthouses`;

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

  createGuestHouse(guestHouse: GuestHouse): Observable<GuestHouse> {
    return this.http.post<GuestHouse>(this.apiUrl, guestHouse, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getGuestHouseById(id: number): Observable<GuestHouse> {
    return this.http.get<GuestHouse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllGuestHouses(): Observable<GuestHouse[]> {
    return this.http.get<GuestHouse[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllGuestHousesWithRooms(): Observable<GuestHouse[]> {
    return this.http.get<GuestHouse[]>(`${this.apiUrl}/with-rooms`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllGuestHousesWithAvailableBeds(): Observable<GuestHouse[]> {
    return this.http.get<GuestHouse[]>(`${this.apiUrl}/with-available-beds`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateGuestHouse(id: number, guestHouse: GuestHouse): Observable<GuestHouse> {
    return this.http.put<GuestHouse>(`${this.apiUrl}/${id}`, guestHouse, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteGuestHouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
} 
