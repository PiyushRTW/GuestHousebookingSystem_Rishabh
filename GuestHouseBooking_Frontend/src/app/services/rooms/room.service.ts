import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
export interface Bed {
  id?: number;
  roomId: number;
  bedNumber: string;
  isAvailable: boolean;
  pricePerNight: number;
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

  // Room operations
  getAllRooms(): Observable<RoomDTO[]> {
    return this.http.get<RoomDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getRoomById(id: number): Observable<RoomDTO> {
    return this.http.get<RoomDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getRoomsByGuestHouse(guestHouseId: number): Observable<RoomDTO[]> {
    console.log('Getting rooms for guest house:', guestHouseId);
    return this.http.get<RoomDTO[]>(`${this.apiUrl}/by-guesthouse/${guestHouseId}`, { headers: this.getHeaders() });
  }

  createRoom(room: RoomDTO): Observable<RoomDTO> {
    return this.http.post<RoomDTO>(this.apiUrl, room, { headers: this.getHeaders() });
  }

  updateRoom(id: number, room: RoomDTO): Observable<RoomDTO> {
    return this.http.put<RoomDTO>(`${this.apiUrl}/${id}`, room, { headers: this.getHeaders() });
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Bed operations
  getAllBeds(): Observable<Bed[]> {
    return this.http.get<Bed[]>(this.bedApiUrl, { headers: this.getHeaders() });
  }

  getBedById(id: number): Observable<Bed> {
    return this.http.get<Bed>(`${this.bedApiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getBedsByRoom(roomId: number): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${this.bedApiUrl}/by-room/${roomId}`, { headers: this.getHeaders() });
  }

  createBed(bed: Bed): Observable<Bed> {
    return this.http.post<Bed>(this.bedApiUrl, bed, { headers: this.getHeaders() });
  }

  updateBed(id: number, bed: Bed): Observable<Bed> {
    return this.http.put<Bed>(`${this.bedApiUrl}/${id}`, bed, { headers: this.getHeaders() });
  }

  deleteBed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.bedApiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Room statistics
  getRoomCount(guestHouseId: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/rooms/count/by-guesthouse/${guestHouseId}`);
  }

  getBedCount(roomId: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/beds/count/by-room/${roomId}`);
  }
}
