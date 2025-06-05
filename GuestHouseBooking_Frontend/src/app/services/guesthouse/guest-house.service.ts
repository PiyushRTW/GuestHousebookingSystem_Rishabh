import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

export interface GuestHouseDTO {
  id?: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  amenities?: string;
  contactNumber?: string;
  email?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.status === 401 || error.status === 403) {
      return throwError(() => new Error('Authentication error'));
    }
    return throwError(() => new Error('Operation failed. Please try again.'));
  }

  createGuestHouse(guestHouse: GuestHouseDTO): Observable<GuestHouseDTO> {
    return this.http.post<GuestHouseDTO>(this.apiUrl, guestHouse, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getGuestHouseById(id: number): Observable<GuestHouseDTO> {
    return this.http.get<GuestHouseDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAllGuestHouses(): Observable<GuestHouseDTO[]> {
    console.log('Getting all guest houses with headers:', this.getHeaders());
    return this.http.get<GuestHouseDTO[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateGuestHouse(id: number, guestHouse: GuestHouseDTO): Observable<GuestHouseDTO> {
    return this.http.put<GuestHouseDTO>(`${this.apiUrl}/${id}`, guestHouse, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteGuestHouse(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      map(response => response.status === 204 || response.status === 200),
      catchError(error => {
        if (error.status === 404) {
          // If the resource is not found, consider it as successfully deleted
          return of(true);
        }
        return this.handleError(error);
      }),
      finalize(() => {
        // Clean up any resources if needed
      })
    );
  }
} 
