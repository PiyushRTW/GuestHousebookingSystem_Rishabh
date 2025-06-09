import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../auth.service';

export interface UserDTO {
  id?: number;
  username: string;
  password?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  register(user: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/register`, user);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, { email, password });
  }

  getUserProfile(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/${id}`);
  }

  updateUserProfile(id: number, user: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/${id}`, user);
  }

  getCurrentUser(): Observable<User> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }
    return this.http.get<User>(`${this.apiUrl}/${currentUser.id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(userData: Partial<User>): Observable<User> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return throwError(() => new Error('No user logged in'));
    }
    
    return this.http.put<User>(`${this.apiUrl}/${currentUser.id}`, userData).pipe(
      tap(updatedUser => {
        
        this.authService.updateStoredUserData(updatedUser);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      
      errorMessage = error.error.message;
    } else {
      
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}