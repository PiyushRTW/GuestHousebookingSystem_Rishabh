import { Component, OnInit } from '@angular/core';

interface Booking {
  bookingId: string;
  hotelName: string;
  roomNumber: number;
  bedName: string;
  arrivalDate: Date;
  departureDate: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  totalCost: number;
}

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  userBookings: Booking[] = [];
  isLoading: boolean = true; // To show a loading indicator

  constructor() { }

  ngOnInit(): void {
    this.loadUserBookings();
  }

  loadUserBookings() {
    // In a real application, you would call a service here to fetch
    // bookings for the currently logged-in user.
    // this.bookingService.getUserBookings().subscribe(data => {
    //   this.userBookings = data;
    //   this.isLoading = false;
    // });

    // Placeholder static data for now:
    setTimeout(() => { // Simulate API call delay
      this.userBookings = [
        {
          bookingId: 'BK1001',
          hotelName: 'The Grand Majestic Hotel',
          roomNumber: 101,
          bedName: 'Bed 1',
          arrivalDate: new Date('2025-06-15'),
          departureDate: new Date('2025-06-18'),
          status: 'Confirmed',
          totalCost: 4500
        },
        {
          bookingId: 'BK1002',
          hotelName: 'Comfort Inn Sayaji',
          roomNumber: 205,
          bedName: 'Bed A',
          arrivalDate: new Date('2025-07-01'),
          departureDate: new Date('2025-07-05'),
          status: 'Pending',
          totalCost: 3200
        },
        {
          bookingId: 'BK1003',
          hotelName: 'Hotel Royal Orchid Central',
          roomNumber: 310,
          bedName: 'Queen Bed',
          arrivalDate: new Date('2025-04-10'),
          departureDate: new Date('2025-04-12'),
          status: 'Cancelled',
          totalCost: 1800
        }
        // Add more booking objects as needed
      ];
      this.isLoading = false;
    }, 1500); // Simulate 1.5 seconds delay
  }

  getStatusClass(status: 'Confirmed' | 'Pending' | 'Cancelled') {
    switch (status) {
      case 'Confirmed':
        return 'status-confirmed';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }
}