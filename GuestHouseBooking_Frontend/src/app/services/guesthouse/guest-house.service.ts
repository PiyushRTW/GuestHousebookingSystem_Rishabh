import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) { }

  createGuestHouse(guestHouse: GuestHouseDTO): Observable<GuestHouseDTO> {
    return this.http.post<GuestHouseDTO>(this.apiUrl, guestHouse);
  }

  getGuestHouseById(id: number): Observable<GuestHouseDTO> {
    return this.http.get<GuestHouseDTO>(`${this.apiUrl}/${id}`);
  }

  getAllGuestHouses(): Observable<GuestHouseDTO[]> {
    return this.http.get<GuestHouseDTO[]>(this.apiUrl);
  }

  updateGuestHouse(id: number, guestHouse: GuestHouseDTO): Observable<GuestHouseDTO> {
    return this.http.put<GuestHouseDTO>(`${this.apiUrl}/${id}`, guestHouse);
  }

  deleteGuestHouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
