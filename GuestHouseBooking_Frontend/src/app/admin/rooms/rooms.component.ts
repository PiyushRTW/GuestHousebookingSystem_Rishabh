import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService, RoomDTO } from '../../services/rooms/room.service';
import { GuestHouseService, GuestHouseDTO } from '../../services/guesthouse/guest-house.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize, takeUntil, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit, OnDestroy {
  roomForm!: FormGroup;
  guestHouses: GuestHouseDTO[] = [];
  rooms: RoomDTO[] = [];
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private guestHouseService: GuestHouseService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if token exists and is valid
    if (!this.authService.isAuthenticated()) {
      this.handleUnauthorized();
      return;
    }

    // Initialize the component
    this.initForm();
    this.loadGuestHouses();

    // Set up token refresh/check interval
    const tokenCheckInterval = setInterval(() => {
      if (!this.authService.isAuthenticated()) {
        clearInterval(tokenCheckInterval);
        this.handleUnauthorized();
      }
    }, 60000); // Check every minute

    // Clean up interval on destroy
    this.destroy$.subscribe(() => clearInterval(tokenCheckInterval));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.roomForm = this.fb.group({
      guestHouseId: [null, Validators.required],
      roomNumber: ['', Validators.required],
      description: [''],
      amenities: ['']
    });

    // Load rooms when guest house is selected
    this.roomForm.get('guestHouseId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(guestHouseId => {
        if (guestHouseId) {
          this.loadRooms(guestHouseId);
        } else {
          this.rooms = [];
        }
      });
  }

  loadGuestHouses(): void {
    this.isLoading = true;
    this.guestHouseService.getAllGuestHouses()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          if (error.status === 401) {
            this.handleUnauthorized();
          } else {
            let errorMessage = 'Error loading guest houses. ';
            if (error.error?.message) {
              errorMessage += error.error.message;
            } else if (error.status === 0) {
              errorMessage += 'Could not connect to the server. Please check your connection.';
            } else {
              errorMessage += 'Please try again.';
            }
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          }
          return of([]); // Return empty array on error
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(guestHouses => {
        this.guestHouses = guestHouses;
      });
  }

  loadRooms(guestHouseId: number): void {
    this.isLoading = true;
    this.rooms = []; // Clear existing rooms while loading
    this.roomService.getRoomsByGuestHouse(guestHouseId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
        },
        error: (error) => {
          console.error('Error loading rooms:', error);
          if (error.status === 401) {
            this.handleUnauthorized();
            return;
          }
          // Only show error message if it's not a 404
          if (error.status !== 404) {
            let errorMessage = 'Error loading rooms. ';
            if (error.error?.message) {
              errorMessage += error.error.message;
            } else {
              errorMessage += 'Please try again.';
            }
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000
            });
          }
          this.rooms = []; // Ensure rooms array is empty on error
        }
      });
  }

  onAddRoom(): void {
    if (this.roomForm.valid) {
      this.isLoading = true;
      const roomData = {
        ...this.roomForm.value
      };

      this.roomService.createRoom(roomData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Room added successfully!', 'Close', {
              duration: 3000
            });
            this.loadRooms(roomData.guestHouseId);
            this.resetForm(roomData.guestHouseId);
          },
          error: (error) => {
            console.error('Error creating room:', error);
            if (error.status === 401) {
              this.handleUnauthorized();
              return;
            }
            let errorMessage = 'Error creating room. ';
            if (error.error?.message) {
              errorMessage += error.error.message;
            } else {
              errorMessage += 'Please try again.';
            }
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000
            });
          }
        });
    } else {
      this.markFormGroupTouched(this.roomForm);
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000
      });
    }
  }

  deleteRoom(roomId: number): void {
    if (confirm('Are you sure you want to delete this room? This will also delete all associated beds.')) {
      this.isLoading = true;
      this.roomService.deleteRoom(roomId)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Room deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadRooms(this.roomForm.get('guestHouseId')?.value);
          },
          error: (error) => {
            console.error('Error deleting room:', error);
            if (error.status === 401) {
              this.handleUnauthorized();
              return;
            }
            let errorMessage = 'Error deleting room. ';
            if (error.error?.message) {
              errorMessage += error.error.message;
            } else {
              errorMessage += 'Please try again.';
            }
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000
            });
          }
        });
    }
  }

  configureBeds(room: RoomDTO): void {
    this.router.navigate(['/admin/rooms/bed-configuration'], { 
      queryParams: { 
        roomId: room.id,
        roomNumber: room.roomNumber
      } 
    });
  }

  private handleUnauthorized(): void {
    this.snackBar.open('Your session has expired. Please log in again.', 'Close', {
      duration: 5000
    });
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private resetForm(guestHouseId: number): void {
    this.roomForm.patchValue({
      guestHouseId: guestHouseId,
      roomNumber: '',
      description: '',
      amenities: ''
    });
    this.markFormGroupUntouched(this.roomForm);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private markFormGroupUntouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupUntouched(control);
      } else {
        if (control !== formGroup.get('guestHouseId')) {
          control.markAsUntouched();
          control.markAsPristine();
        }
      }
    });
  }
}