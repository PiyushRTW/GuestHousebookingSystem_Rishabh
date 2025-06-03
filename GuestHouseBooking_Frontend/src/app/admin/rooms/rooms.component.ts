import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService, RoomDTO } from '../../services/rooms/room.service';
import { GuestHouseService, GuestHouseDTO } from '../../services/guesthouse/guest-house.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  roomForm!: FormGroup;
  guestHouses: GuestHouseDTO[] = [];
  rooms: RoomDTO[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private guestHouseService: GuestHouseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadGuestHouses();
    this.initForm();
  }

  initForm(): void {
    this.roomForm = this.fb.group({
      guestHouseId: [null, Validators.required],
      roomNumber: ['', Validators.required],
      description: [''],
      amenities: ['']
    });

    // Load rooms when guest house is selected
    this.roomForm.get('guestHouseId')?.valueChanges.subscribe(guestHouseId => {
      if (guestHouseId) {
        this.loadRooms(guestHouseId);
      } else {
        this.rooms = [];
      }
    });
  }

  loadGuestHouses(): void {
    this.isLoading = true;
    this.guestHouseService.getAllGuestHouses().subscribe({
      next: (guestHouses) => {
        this.guestHouses = guestHouses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading guest houses:', error);
        let errorMessage = 'Error loading guest houses. ';
        if (error.error?.message) {
          errorMessage += error.error.message;
        } else if (error.status === 0) {
          errorMessage += 'Could not connect to the server. Please check your connection.';
        } else {
          errorMessage += 'Please try again.';
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  loadRooms(guestHouseId: number): void {
    this.isLoading = true;
    this.rooms = []; // Clear existing rooms while loading
    this.roomService.getRoomsByGuestHouse(guestHouseId).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        let errorMessage = 'Error loading rooms. ';
        if (error.error?.message) {
          errorMessage += error.error.message;
        } else {
          errorMessage += 'Please try again.';
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  onAddRoom(): void {
    if (this.roomForm.valid) {
      this.isLoading = true;
      const roomData = {
        ...this.roomForm.value
      };

      this.roomService.createRoom(roomData).subscribe({
        next: (room) => {
          this.snackBar.open('Room added successfully!', 'Close', {
            duration: 3000
          });
          this.loadRooms(roomData.guestHouseId);
          this.resetForm(roomData.guestHouseId);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating room:', error);
          let errorMessage = 'Error creating room. ';
          if (error.error?.message) {
            errorMessage += error.error.message;
          } else {
            errorMessage += 'Please try again.';
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
    } else {
      this.roomForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000
      });
    }
  }

  deleteRoom(roomId: number): void {
    if (confirm('Are you sure you want to delete this room? This will also delete all associated beds.')) {
      this.isLoading = true;
      this.roomService.deleteRoom(roomId).subscribe({
        next: () => {
          this.snackBar.open('Room deleted successfully', 'Close', {
            duration: 3000
          });
          this.loadRooms(this.roomForm.get('guestHouseId')?.value);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting room:', error);
          let errorMessage = 'Error deleting room. ';
          if (error.error?.message) {
            errorMessage += error.error.message;
          } else {
            errorMessage += 'Please try again.';
          }
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
    }
  }

  configureBeds(roomId: number): void {
    this.router.navigate(['/admin/rooms/bed-configuration'], { queryParams: { roomId } });
  }

  private resetForm(guestHouseId: number): void {
    this.roomForm.patchValue({
      guestHouseId: guestHouseId,
      roomNumber: '',
      description: '',
      amenities: ''
    });
    Object.keys(this.roomForm.controls).forEach(key => {
      const control = this.roomForm.get(key);
      if (key !== 'guestHouseId') {
        control?.markAsUntouched();
        control?.markAsPristine();
      }
    });
  }
}