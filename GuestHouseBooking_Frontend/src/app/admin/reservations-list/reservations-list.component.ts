import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Booking, BookingStatus } from 'src/app/shared/models/booking.model';
import { GuestHouse } from 'src/app/shared/models/guesthouse.model';
import { Room } from 'src/app/shared/models/room.model';
import { Bed } from 'src/app/shared/models/bed.model';
import { BookingService } from 'src/app/services/bookings/booking.service';
import { GuestHouseService } from 'src/app/services/guesthouse/guest-house.service';
import { RoomService } from 'src/app/services/rooms/room.service';
import { BookingDetailDialogComponent } from '../booking-detail-dialog.component';

@Component({
  selector: 'app-reservations-list',
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.scss']
})
export class ReservationsListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'guestName',
    'guestHouseName',
    'roomNumber',
    'bedNumber',
    'checkInDate',
    'checkOutDate',
    'status',
    'totalPrice',
    'actions'
  ];
  dataSource!: MatTableDataSource<Booking>;
  isLoading: boolean = true;
  filterForm: FormGroup;
  allBookings: Booking[] = [];
  guestHouses: GuestHouse[] = [];
  availableRooms: Room[] = [];
  availableBeds: Bed[] = [];
  minDate: Date = new Date();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private bookingService: BookingService,
    private guestHouseService: GuestHouseService,
    private roomService: RoomService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      guestHouse: [''],
      room: [''],
      bed: [''],
      startDate: [''],
      endDate: [''],
      status: [BookingStatus.CONFIRMED]
    });
  }

  ngOnInit(): void {
    this.loadGuestHouses();
    this.loadBookings();
    this.setupFilterListener();
  }

  loadGuestHouses(): void {
    this.guestHouseService.getAllGuestHousesWithRooms().subscribe({
      next: (guestHouses) => {
        this.guestHouses = guestHouses;
      },
      error: (error) => {
        console.error('Error loading guest houses:', error);
        this.snackBar.open('Error loading guest houses', 'Close', { duration: 3000 });
      }
    });
  }

  onGuestHouseChange(): void {
    const guestHouseId = this.filterForm.get('guestHouse')?.value;
    if (guestHouseId) {
      this.roomService.getRoomsByGuestHouseId(guestHouseId).subscribe({
        next: (rooms: Room[]) => {
          this.availableRooms = rooms;
          this.filterForm.patchValue({ room: '', bed: '' });
          this.availableBeds = [];
        },
        error: (error: any) => {
          console.error('Error loading rooms:', error);
          this.snackBar.open('Error loading rooms', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.availableRooms = [];
      this.availableBeds = [];
      this.filterForm.patchValue({ room: '', bed: '' });
    }
    this.applyFilters();
  }

  onRoomChange(): void {
    const roomId = this.filterForm.get('room')?.value;
    if (roomId) {
      const selectedRoom = this.availableRooms.find(room => room.id === roomId);
      if (selectedRoom && selectedRoom.beds) {
        this.availableBeds = selectedRoom.beds;
      } else {
        this.availableBeds = [];
      }
      this.filterForm.patchValue({ bed: '' });
    } else {
      this.availableBeds = [];
      this.filterForm.patchValue({ bed: '' });
    }
    this.applyFilters();
  }

  setupFilterListener(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getAllBookings(BookingStatus.CONFIRMED).subscribe({
      next: (bookings) => {
        this.allBookings = bookings;
        this.dataSource = new MatTableDataSource(bookings);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.snackBar.open('Error loading bookings. Please try again.', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filteredBookings = this.allBookings;

    // Filter by guest house
    if (filters.guestHouse) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.guestHouseId === filters.guestHouse
      );
    }

    // Filter by room
    if (filters.room) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.roomId === filters.room
      );
    }

    // Filter by bed
    if (filters.bed) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.bedId === filters.bed
      );
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      filteredBookings = filteredBookings.filter(booking => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        return checkIn >= startDate && checkOut <= endDate;
      });
    }

    // Filter by status
    if (filters.status) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.status === filters.status
      );
    }

    this.dataSource.data = filteredBookings;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewBookingDetails(booking: Booking): void {
    this.dialog.open(BookingDetailDialogComponent, {
      width: '800px',
      data: booking
    });
  }

  completeBooking(bookingId: number): void {
    this.isLoading = true;
    this.bookingService.completeBooking(bookingId).subscribe({
      next: () => {
        this.snackBar.open('Booking marked as completed successfully', 'Close', {
          duration: 3000
        });
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error completing booking:', error);
        this.snackBar.open('Error completing booking. Please try again.', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  cancelBooking(bookingId: number): void {
    this.isLoading = true;
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        this.snackBar.open('Booking cancelled successfully', 'Close', {
          duration: 3000
        });
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        this.snackBar.open('Error cancelling booking. Please try again.', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  getGuestName(booking: Booking): string {
    return `${booking.firstName} ${booking.lastName}`;
  }
}
