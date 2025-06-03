import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) { }

  // Room operations
  getAllRooms(): Observable<RoomDTO[]> {
    return this.http.get<RoomDTO[]>(this.apiUrl);
  }

  getRoomById(id: number): Observable<RoomDTO> {
    return this.http.get<RoomDTO>(`${this.apiUrl}/${id}`);
  }

  getRoomsByGuestHouse(guestHouseId: number): Observable<RoomDTO[]> {
    return this.http.get<RoomDTO[]>(`${this.apiUrl}/by-guesthouse/${guestHouseId}`);
  }

  createRoom(room: RoomDTO): Observable<RoomDTO> {
    return this.http.post<RoomDTO>(this.apiUrl, room);
  }

  updateRoom(id: number, room: RoomDTO): Observable<RoomDTO> {
    return this.http.put<RoomDTO>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Bed operations
  getAllBeds(): Observable<Bed[]> {
    return this.http.get<Bed[]>(`${environment.apiUrl}/beds`);
  }

  getBedById(id: number): Observable<Bed> {
    return this.http.get<Bed>(`${environment.apiUrl}/beds/${id}`);
  }

  getBedsByRoom(roomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/beds/by-room/${roomId}`);
  }

  createBed(bed: Bed): Observable<Bed> {
    return this.http.post<Bed>(`${environment.apiUrl}/beds`, bed);
  }

  updateBed(id: number, bed: Bed): Observable<Bed> {
    return this.http.put<Bed>(`${environment.apiUrl}/beds/${id}`, bed);
  }

  deleteBed(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/beds/${id}`);
  }

  // Room statistics
  getRoomCount(guestHouseId: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/rooms/count/by-guesthouse/${guestHouseId}`);
  }

  getBedCount(roomId: number): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/beds/count/by-room/${roomId}`);
  }
}
