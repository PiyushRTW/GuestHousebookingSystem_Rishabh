import { Component, OnInit } from '@angular/core';
import { BookingRequest } from '../../shared/interfaces/booking-request.interface'; // Assuming you create this interface

@Component({
  selector: 'app-guests',
  templateUrl: './guests.component.html',
  styleUrls: ['./guests.component.scss']
})
export class GuestsComponent implements OnInit {
  bookingRequests: BookingRequest[] = [];
  displayedColumns: string[] = [
    'requestId',
    'guestName',
    'hotelName',
    'roomName',
    'arrivalDate',
    'departureDate',
    'numberOfGuests',
    'requestDate',
    'status',
    'actions'
  ];
  isLoading: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.loadBookingRequests();
  }

  loadBookingRequests() {
    // In a real application, fetch booking requests from your backend service
    // this.bookingService.getBookingRequests().subscribe(
    //   (data) => {
    //     this.bookingRequests = data;
    //     this.isLoading = false;
    //   },
    //   (error) => {
    //     console.error('Error loading booking requests:', error);
    //     this.isLoading = false;
    //     // Handle error display to the user
    //   }
    // );

    // Placeholder static data for now:
    setTimeout(() => {
      this.bookingRequests = [
        {
          requestId: 'BR001',
          userId: 'user123',
          guestName: 'Alice Smith',
          hotelId: 1,
          hotelName: 'Luxury Grand Hotel',
          roomId: 101,
          roomName: 'Deluxe Suite',
          bedId: 1,
          bedName: 'King Bed',
          arrivalDate: new Date('2025-06-20'),
          departureDate: new Date('2025-06-25'),
          numberOfGuests: 2,
          requestDate: new Date('2025-06-15T10:00:00Z'),
          status: 'Pending'
        },
        {
          requestId: 'BR002',
          userId: 'user456',
          guestName: 'Bob Johnson',
          hotelId: 2,
          hotelName: 'Cozy Inn',
          roomId: 202,
          roomName: 'Standard Double',
          bedId: 3,
          bedName: 'Double Bed',
          arrivalDate: new Date('2025-07-05'),
          departureDate: new Date('2025-07-08'),
          numberOfGuests: 1,
          requestDate: new Date('2025-06-18T14:30:00Z'),
          status: 'Pending'
        },
        // Add more booking requests
      ];
      this.isLoading = false;
    }, 1500);
  }

  approveRequest(requestId: string) {
    // Call your backend service to approve the booking request
    // this.bookingService.approveBookingRequest(requestId).subscribe(() => {
    //   this.loadBookingRequests(); // Reload the list after approval
    // });
    console.log('Approve request:', requestId);
    this.bookingRequests = this.bookingRequests.map(req =>
      req.requestId === requestId ? { ...req, status: 'Approved' } : req
    ); // Temporary UI update
  }

  rejectRequest(requestId: string) {
    // Call your backend service to reject the booking request
    // this.bookingService.rejectBookingRequest(requestId).subscribe(() => {
    //   this.loadBookingRequests(); // Reload the list after rejection
    // });
    console.log('Reject request:', requestId);
    this.bookingRequests = this.bookingRequests.map(req =>
      req.requestId === requestId ? { ...req, status: 'Rejected' } : req
    ); // Temporary UI update
  }

  getStatusClass(status: 'Pending' | 'Approved' | 'Rejected') {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }
}