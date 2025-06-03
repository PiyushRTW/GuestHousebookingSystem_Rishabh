import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BedDTO {
  id?: number;
  roomId: number;
  bedNumber: string;
  isAvailable: boolean;
  pricePerNight: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BedService {
  private apiUrl = `${environment.apiUrl}/beds`;

  constructor(private http: HttpClient) { }

  // Get all beds
  getAllBeds(): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(this.apiUrl);
  }

  // Get bed by ID
  getBedById(id: number): Observable<BedDTO> {
    return this.http.get<BedDTO>(`${this.apiUrl}/${id}`);
  }

  // Get beds by room ID
  getBedsByRoomId(roomId: number): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(`${this.apiUrl}/by-room/${roomId}`);
  }

  // Create new bed
  createBed(bed: BedDTO): Observable<BedDTO> {
    return this.http.post<BedDTO>(this.apiUrl, bed);
  }

  // Update bed
  updateBed(id: number, bed: BedDTO): Observable<BedDTO> {
    return this.http.put<BedDTO>(`${this.apiUrl}/${id}`, bed);
  }

  // Delete bed
  deleteBed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
