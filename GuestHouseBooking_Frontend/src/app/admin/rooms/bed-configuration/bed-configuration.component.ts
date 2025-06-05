import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService } from '../../../services/rooms/room.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bed-configuration',
  templateUrl: './bed-configuration.component.html',
  styleUrls: ['./bed-configuration.component.scss']
})
export class BedConfigurationComponent implements OnInit {
  bedForm!: FormGroup;
  rooms: any[] = [];
  beds: any[] = [];
  isLoading = false;
  selectedRoomId: number | null = null;
  bedCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadRooms();
  }

  initForm(): void {
    this.bedForm = this.fb.group({
      roomId: [null, Validators.required],
      bedNumber: ['', Validators.required],
      pricePerNight: [0, [Validators.required, Validators.min(0)]]
    });

    // Load beds when room is selected
    this.bedForm.get('roomId')?.valueChanges.subscribe(roomId => {
      if (roomId) {
        this.selectedRoomId = roomId;
        this.loadBedsForRoom(roomId);
      }
    });
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.snackBar.open('Error loading rooms', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadBedsForRoom(roomId: number): void {
    this.isLoading = true;
    this.roomService.getBedsByRoom(roomId).subscribe({
      next: (beds) => {
        this.beds = beds;
        this.bedCount = beds.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading beds:', error);
        this.snackBar.open('Error loading beds', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onAddBed(): void {
    if (this.bedForm.valid) {
      this.isLoading = true;
      const bedData = {
        roomId: this.bedForm.get('roomId')?.value,
        bedNumber: this.bedForm.get('bedNumber')?.value,
        isAvailable: true,
        pricePerNight: this.bedForm.get('pricePerNight')?.value
      };

      this.roomService.createBed(bedData).subscribe({
        next: () => {
          this.snackBar.open('Bed added successfully', 'Close', { duration: 3000 });
          this.loadBedsForRoom(bedData.roomId);
          this.bedForm.patchValue({ bedNumber: '' });
        },
        error: (error) => {
          console.error('Error adding bed:', error);
          this.snackBar.open('Error adding bed', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  deleteBed(bedId: number): void {
    if (confirm('Are you sure you want to delete this bed?')) {
      this.isLoading = true;
      this.roomService.deleteBed(bedId).subscribe({
        next: () => {
          this.snackBar.open('Bed deleted successfully', 'Close', { duration: 3000 });
          this.loadBedsForRoom(this.selectedRoomId!);
        },
        error: (error) => {
          console.error('Error deleting bed:', error);
          this.snackBar.open('Error deleting bed', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }
} 