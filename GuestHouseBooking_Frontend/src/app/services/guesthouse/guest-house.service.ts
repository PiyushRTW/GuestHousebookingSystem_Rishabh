import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
      .pipe(
        tap(response => console.log('Created guest house:', response)),
        catchError(this.handleError)
      );
  }

  getGuestHouseById(id: number): Observable<GuestHouse> {
    return this.http.get<GuestHouse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('Fetched guest house:', response)),
        catchError(this.handleError)
      );
  }

  getAllGuestHouses(): Observable<GuestHouse[]> {
    return this.http.get<GuestHouse[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('Fetched all guest houses:', response)),
        catchError(error => {
          if (error.status === 404) {
            console.log('No guest houses found, returning empty array');
            return of([]);
          }
          return this.handleError(error);
        })
      );
  }

  getAllGuestHousesWithRooms(): Observable<GuestHouse[]> {
    return this.http.get<GuestHouse[]>(`${this.apiUrl}/with-rooms`, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('Fetched guest houses with rooms:', response)),
        catchError(error => {
          if (error.status === 404) {
            console.log('No guest houses with rooms found, returning empty array');
            return of([]);
          }
          return this.handleError(error);
        })
      );
  }

  getAllGuestHousesWithAvailableBeds(): Observable<GuestHouse[]> {
    return this.http.get<GuestHouse[]>(`${this.apiUrl}/with-available-beds`, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('Fetched guest houses with available beds:', response)),
        catchError(error => {
          if (error.status === 404) {
            console.log('No guest houses with available beds found, returning empty array');
            return of([]);
          }
          return this.handleError(error);
        })
      );
  }

  updateGuestHouse(id: number, guestHouse: GuestHouse): Observable<GuestHouse> {
    return this.http.put<GuestHouse>(`${this.apiUrl}/${id}`, guestHouse, { headers: this.getHeaders() })
      .pipe(
        tap(response => console.log('Updated guest house:', response)),
        catchError(this.handleError)
      );
  }

  deleteGuestHouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log('Deleted guest house:', id)),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);

    if (error.status === 401) {
      
      this.authService.logout();
      return throwError(() => new Error('Session expired. Please login again.'));
    }

    if (error.error instanceof ErrorEvent) {
      
      return throwError(() => new Error('An error occurred: ' + error.error.message));
    } else {
      
      let errorMessage = 'An error occurred: ';
      if (error.error?.message) {
        errorMessage += error.error.message;
      } else {
        errorMessage += `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      return throwError(() => new Error(errorMessage));
    }
  }
} 
