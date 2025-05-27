import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GuestHouse } from '../../shared/models/guesthouse.model';

@Injectable({
  providedIn: 'root'
})
export class GuestHouseService {
  private apiUrl = `${environment.apiUrl}/guesthouses`;

  constructor(private http: HttpClient) { }

  // Get all guest houses
  getAllGuestHouses(): Observable<GuestHouse[]> {
    return this.http.get<GuestHouse[]>(this.apiUrl);
  }

  // Get guest house by ID
  getGuestHouseById(id: number): Observable<GuestHouse> {
    return this.http.get<GuestHouse>(`${this.apiUrl}/${id}`);
  }

  // Create new guest house
  createGuestHouse(guestHouse: GuestHouse): Observable<GuestHouse> {
    return this.http.post<GuestHouse>(this.apiUrl, guestHouse);
  }

  // Update guest house
  updateGuestHouse(id: number, guestHouse: GuestHouse): Observable<GuestHouse> {
    return this.http.put<GuestHouse>(`${this.apiUrl}/${id}`, guestHouse);
  }

  // Delete guest house
  deleteGuestHouse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
