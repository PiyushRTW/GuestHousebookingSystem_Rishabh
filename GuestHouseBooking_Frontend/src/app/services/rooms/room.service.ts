import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

// Room DTO matching backend entity
export interface RoomDTO {
  id?: number;
  guestHouseId: number;
  roomNumber: string;
  description?: string;
  amenities?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Bed DTO matching backend entity
export interface BedDTO {
  id?: number;
  roomId: number;
  bedNumber: string;
  isAvailable: boolean;
  pricePerNight: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;
  private bedApiUrl = `${environment.apiUrl}/beds`;

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

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      // Try token refresh before logging out
      this.authService.refreshToken().pipe(
        catchError(() => {
          this.authService.logout();
          return throwError(() => new Error('Session expired. Please login again.'));
        })
      ).subscribe();
    }
    if (error.status === 404) {
      return throwError(() => new Error('Resource not found'));
    }
    return throwError(() => error);
  }

  // Room operations
  getAllRooms(): Observable<RoomDTO[]> {
    return this.http.get<RoomDTO[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getRoomById(id: number): Observable<RoomDTO> {
    return this.http.get<RoomDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getRoomsByGuestHouse(guestHouseId: number): Observable<RoomDTO[]> {
    return this.http.get<RoomDTO[]>(`${this.apiUrl}/by-guesthouse/${guestHouseId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  createRoom(room: RoomDTO): Observable<RoomDTO> {
    return this.http.post<RoomDTO>(this.apiUrl, room, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  updateRoom(id: number, room: RoomDTO): Observable<RoomDTO> {
    return this.http.put<RoomDTO>(`${this.apiUrl}/${id}`, room, { headers: this.getHeaders() });
  }

  deleteRoom(roomId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roomId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // Bed operations
  getAllBeds(): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(this.bedApiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getBedById(id: number): Observable<BedDTO> {
    return this.http.get<BedDTO>(`${this.bedApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getBedsByRoom(roomId: number): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(`${this.bedApiUrl}/by-room/${roomId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  createBed(bed: BedDTO): Observable<BedDTO> {
    return this.http.post<BedDTO>(this.bedApiUrl, bed, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  updateBed(id: number, bed: BedDTO): Observable<BedDTO> {
    return this.http.put<BedDTO>(`${this.bedApiUrl}/${id}`, bed, { headers: this.getHeaders() });
  }

  deleteBed(bedId: number): Observable<void> {
    return this.http.delete<void>(`${this.bedApiUrl}/${bedId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  // Room statistics
  getRoomCount(guestHouseId: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/rooms/count/by-guesthouse/${guestHouseId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getBedCount(roomId: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/beds/count/by-room/${roomId}`)
      .pipe(catchError(this.handleError.bind(this)));
  }
}
