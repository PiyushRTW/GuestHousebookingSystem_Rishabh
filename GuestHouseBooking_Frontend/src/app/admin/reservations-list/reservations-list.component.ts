import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog'; // For opening the detail dialog

import { Booking } from 'src/app/shared/interfaces/Booking.interface';// Import the Booking interface
import { BookingDetailDialogComponent } from '../booking-detail-dialog.component';// Import the detail dialog

@Component({
  selector: 'app-reservations-list',
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.scss']
})
export class ReservationsListComponent implements OnInit {

  displayedColumns: string[] = [
    'id',
    'guestName',
    'hotelName',
    'roomNumber',
    'checkInDate',
    'checkOutDate',
    'status',
    'totalCost',
    'actions'
  ];
  dataSource!: MatTableDataSource<Booking>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Mock Booking Data
  private mockBookings: Booking[] = [
    {
      id: 'BKG001',
      bookingDate: new Date('2024-05-10T10:00:00'),
      guestName: 'John Doe',
      guestEmail: 'john.doe@example.com',
      guestPhone: '1112223333',
      hotelId: 1,
      hotelName: 'Grand Hyatt',
      roomId: 101,
      roomNumber: '101',
      bedType: 'double',
      checkInDate: new Date('2024-06-01'),
      checkOutDate: new Date('2024-06-05'),
      pricePerNight: 150,
      numberOfNights: 4,
      totalCost: 600,
      status: 'Confirmed',
      approvedBy: 'Admin User',
      approvalDate: new Date('2024-05-11T09:30:00')
    },
    {
      id: 'BKG002',
      bookingDate: new Date('2024-05-12T14:30:00'),
      guestName: 'Jane Smith',
      guestEmail: 'jane.smith@example.com',
      guestPhone: '4445556666',
      hotelId: 2,
      hotelName: 'Urban Oasis',
      roomId: 201,
      roomNumber: '201',
      bedType: 'double',
      checkInDate: new Date('2024-06-10'),
      checkOutDate: new Date('2024-06-12'),
      pricePerNight: 120,
      numberOfNights: 2,
      totalCost: 240,
      status: 'Confirmed',
      approvedBy: 'Admin User',
      approvalDate: new Date('2024-05-12T15:00:00')
    },
    {
      id: 'BKG003',
      bookingDate: new Date('2024-05-15T09:00:00'),
      guestName: 'Mike Johnson',
      guestEmail: 'mike.j@example.com',
      guestPhone: '7778889999',
      hotelId: 1,
      hotelName: 'Grand Hyatt',
      roomId: 102,
      roomNumber: '102',
      bedType: 'single',
      checkInDate: new Date('2024-07-01'),
      checkOutDate: new Date('2024-07-03'),
      pricePerNight: 100,
      numberOfNights: 2,
      totalCost: 200,
      status: 'Pending' // Example of a pending booking
    },
    {
        id: 'BKG004',
        bookingDate: new Date('2024-05-16T11:00:00'),
        guestName: 'Alice Brown',
        guestEmail: 'alice.b@example.com',
        guestPhone: '1231231234',
        hotelId: 3,
        hotelName: 'Riverside Inn',
        roomId: 301,
        roomNumber: '301',
        bedType: 'double',
        checkInDate: new Date('2024-06-20'),
        checkOutDate: new Date('2024-06-25'),
        pricePerNight: 90,
        numberOfNights: 5,
        totalCost: 450,
        status: 'Confirmed',
        approvedBy: 'Admin User',
        approvalDate: new Date('2024-05-16T11:30:00')
    },
    {
        id: 'BKG005',
        bookingDate: new Date('2024-05-18T16:00:00'),
        guestName: 'Bob White',
        guestEmail: 'bob.w@example.com',
        guestPhone: '9876543210',
        hotelId: 2,
        hotelName: 'Urban Oasis',
        roomId: 202,
        roomNumber: '202',
        bedType: 'single',
        checkInDate: new Date('2024-07-15'),
        checkOutDate: new Date('2024-07-18'),
        pricePerNight: 80,
        numberOfNights: 3,
        totalCost: 240,
        status: 'Cancelled' // Example of a cancelled booking
    }
  ];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    // In a real app, fetch from backend. For now, use mock data.
    // Filter for 'Confirmed' bookings initially as per your request,
    // but you might want to show all statuses or add filter options later.
    const confirmedBookings = this.mockBookings.filter(b => b.status === 'Confirmed');
    this.dataSource = new MatTableDataSource(confirmedBookings);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Opens a dialog to display detailed information about a booking.
   * @param booking The booking object to display.
   */
  viewBookingDetails(booking: Booking): void {
    this.dialog.open(BookingDetailDialogComponent, {
      width: '600px', // Adjust width as needed
      data: booking // Pass the entire booking object to the dialog
    });
  }
}
