import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bed } from '../../shared/models/bed.model';

export interface BedDTO {
  id?: number;
  roomId: number;
  bedNumber: string;
  isAvailable: boolean;
  isAvailableForBooking: boolean;
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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  
  getAllBeds(): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(this.apiUrl);
  }

  
  getBedById(bedId: number): Observable<Bed> {
    return this.http.get<Bed>(`${this.apiUrl}/${bedId}`, {
      headers: this.getHeaders()
    });
  }

  
  getBedsByRoomId(roomId: number): Observable<BedDTO[]> {
    return this.http.get<BedDTO[]>(`${this.apiUrl}/by-room/${roomId}`);
  }

  
  createBed(bed: BedDTO): Observable<BedDTO> {
    return this.http.post<BedDTO>(this.apiUrl, bed);
  }

  
  updateBed(id: number, bed: BedDTO): Observable<BedDTO> {
    return this.http.put<BedDTO>(`${this.apiUrl}/${id}`, bed);
  }

  
  deleteBed(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvailableBeds(roomId: number, checkIn: Date, checkOut: Date): Observable<Bed[]> {
    
    const params = new HttpParams()
      .set('roomId', roomId.toString())
      .set('checkIn', checkIn.toISOString().split('T')[0])
      .set('checkOut', checkOut.toISOString().split('T')[0]);

    return this.http.get<Bed[]>(`${this.apiUrl}/available`, {
      headers: this.getHeaders(),
      params: params
    });
  }
}
