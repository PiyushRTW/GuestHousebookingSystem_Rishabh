import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';
import { Room } from '../../shared/models/room.model';


export interface RoomDTO {
  id?: number;
  guestHouseId: number;
  roomNumber: string;
  description?: string;
  amenities?: string;
  imageUrl?: string;
  beds?: BedDTO[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}


export interface BedDTO {
  id?: number;
  roomId: number;
  bedNumber: string;
  isAvailable: boolean;
  isAvailableForBooking: boolean;
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
    console.error('An error occurred:', error);
    if (error.status === 401) {
      
      this.authService.refreshToken().pipe(
        catchError(() => {
          this.authService.logout();
          return throwError(() => new Error('Session expired. Please login again.'));
        })
      ).subscribe();
    }
    return throwError(() => error);
  }

  
  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getRoomsByGuestHouseId(guestHouseId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/by-guesthouse/${guestHouseId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(error => {
        if (error.status === 404) {
          
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  createRoom(room: RoomDTO): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  updateRoom(id: number, room: RoomDTO): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room, { 
      headers: this.getHeaders() 
    }).pipe(catchError(this.handleError.bind(this)));
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(catchError(this.handleError.bind(this)));
  }

  
  getAllBeds(): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(this.bedApiUrl, { 
      headers: this.getHeaders() 
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getBedById(id: number): Observable<BedDTO> {
    return this.http.get<BedDTO>(`${this.bedApiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getBedsByRoom(roomId: number): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(`${this.bedApiUrl}/by-room/${roomId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 404) {
          
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  createBed(bed: BedDTO): Observable<BedDTO> {
    return this.http.post<BedDTO>(this.bedApiUrl, bed, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  updateBed(id: number, bed: BedDTO): Observable<BedDTO> {
    return this.http.put<BedDTO>(`${this.bedApiUrl}/${id}`, bed, { 
      headers: this.getHeaders() 
    }).pipe(catchError(this.handleError.bind(this)));
  }

  deleteBed(bedId: number): Observable<void> {
    return this.http.delete<void>(`${this.bedApiUrl}/${bedId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  
  getRoomCount(guestHouseId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/by-guesthouse/${guestHouseId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }

  getBedCount(roomId: number): Observable<number> {
    return this.http.get<number>(`${this.bedApiUrl}/count/by-room/${roomId}`, {
      headers: this.getHeaders()
    }).pipe(catchError(this.handleError.bind(this)));
  }
}
