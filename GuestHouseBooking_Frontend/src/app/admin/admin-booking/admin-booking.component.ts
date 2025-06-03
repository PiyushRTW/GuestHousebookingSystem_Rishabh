import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { GuestHouse } from '../../shared/models/guesthouse.model';


// If you prefer not to create room.model.ts, define it here:

export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  bedType: 'single' | 'double' | 'suite';
  pricePerNight: number;
}


@Component({
  selector: 'app-admin-booking',
  templateUrl: './admin-booking.component.html',
  styleUrls: ['./admin-booking.component.scss']
})
export class AdminBookingComponent implements OnInit {

  bookingForm!: FormGroup;
  hotels: GuestHouse[] = [];
  allRooms: Room[] = []; // All mock rooms
  availableRooms: Room[] = []; // Filtered rooms based on hotel and dates

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.loadMockData(); // Load mock hotels and rooms
    this.setupFormListeners();
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      hotelId: [null, Validators.required],
      checkInDate: [null, Validators.required],
      checkOutDate: [null, Validators.required],
      roomId: [null, Validators.required], // Will hold the ID of the selected room
      guestName: ['', Validators.required],
      guestEmail: ['', [Validators.required, Validators.email]],
      guestPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]] // Simple 10-digit phone validation
    }, {
      validators: this.dateRangeValidator // Apply cross-field validator for dates
    });
  }

  // Custom validator for check-out date >= check-in date AND dates not in past
  dateRangeValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const checkIn = control.get('checkInDate')?.value;
    const checkOut = control.get('checkOutDate')?.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    if (!checkIn || !checkOut) {
      return null; // Don't validate if dates are not selected yet
    }

    if (checkIn < today) {
      control.get('checkInDate')?.setErrors({ pastDate: true });
    } else {
      control.get('checkInDate')?.setErrors(null);
    }

    if (checkOut < today) {
        control.get('checkOutDate')?.setErrors({ pastDate: true });
    } else {
        control.get('checkOutDate')?.setErrors(null);
    }


    if (checkIn && checkOut && checkIn > checkOut) {
      return { 'invalidDateRange': true };
    }

    return null;
  };


  // Load mock data for hotels and rooms
  loadMockData(): void {
    this.hotels = [
      {
        id: 1,
        name: 'Grand Hyatt',
        address: '123 Park Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        description: 'Luxury hotel.',
        amenities: 'WiFi, Pool, Gym',
        contactNumber: '+1-234-567-8900',
        email: 'info@grandhyatt.com',
        imageUrl: 'assets/hotel1.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Urban Oasis',
        address: '456 Main St',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        description: 'Modern hotel.',
        amenities: 'WiFi, Restaurant',
        contactNumber: '+1-234-567-8901',
        email: 'info@urbanoasis.com',
        imageUrl: 'assets/hotel2.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Riverside Inn',
        address: '789 River Rd',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        description: 'Cozy inn.',
        amenities: 'WiFi, Parking',
        contactNumber: '+1-234-567-8902',
        email: 'info@riversideinn.com',
        imageUrl: 'assets/hotel3.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.allRooms = [
      { id: 101, hotelId: 1, roomNumber: '101', bedType: 'double', pricePerNight: 150 },
      { id: 102, hotelId: 1, roomNumber: '102', bedType: 'single', pricePerNight: 100 },
      { id: 103, hotelId: 1, roomNumber: '103', bedType: 'suite', pricePerNight: 300 },
      { id: 201, hotelId: 2, roomNumber: '201', bedType: 'double', pricePerNight: 120 },
      { id: 202, hotelId: 2, roomNumber: '202', bedType: 'single', pricePerNight: 80 },
      { id: 301, hotelId: 3, roomNumber: '301', bedType: 'double', pricePerNight: 90 },
      { id: 302, hotelId: 3, roomNumber: '302', bedType: 'single', pricePerNight: 70 },
    ];
  }

  // Set up listeners for form changes to update available rooms
  setupFormListeners(): void {
    // Listen to changes in hotelId, checkInDate, checkOutDate
    this.bookingForm.get('hotelId')?.valueChanges.subscribe(() => this.filterAvailableRooms());
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => this.filterAvailableRooms());
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => this.filterAvailableRooms());
  }

  // Filter rooms based on selected hotel and (mock) availability
  filterAvailableRooms(): void {
    const selectedHotelId = this.bookingForm.get('hotelId')?.value;
    const checkInDate = this.bookingForm.get('checkInDate')?.value;
    const checkOutDate = this.bookingForm.get('checkOutDate')?.value;

    if (selectedHotelId && checkInDate && checkOutDate && !this.bookingForm.hasError('invalidDateRange')) {
      // For frontend mock, we'll just filter by hotel ID.
      // A real implementation would involve complex availability checks against existing bookings.
      this.availableRooms = this.allRooms.filter(room => room.hotelId === selectedHotelId);
      // Reset selected room if previously selected room is no longer available
      const currentRoomId = this.bookingForm.get('roomId')?.value;
      if (currentRoomId && !this.availableRooms.some(room => room.id === currentRoomId)) {
        this.bookingForm.get('roomId')?.setValue(null);
      }
    } else {
      this.availableRooms = [];
      this.bookingForm.get('roomId')?.setValue(null); // Clear room selection
    }
  }

  // Handle form submission
  bookRoom(): void {
    // Manually trigger validation for cross-field validators before checking validity
    this.bookingForm.updateValueAndValidity();

    if (this.bookingForm.valid) {
      const bookingData = this.bookingForm.value;
      const selectedRoom = this.allRooms.find(room => room.id === bookingData.roomId);
      const selectedHotel = this.hotels.find(hotel => hotel.id === bookingData.hotelId);

      if (selectedRoom && selectedHotel) {
        // Calculate estimated cost (simple: price per night * number of nights)
        const checkIn = bookingData.checkInDate;
        const checkOut = bookingData.checkOutDate;
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalCost = selectedRoom.pricePerNight * diffDays;

        const finalBookingDetails = {
          ...bookingData,
          hotelName: selectedHotel.name,
          roomNumber: selectedRoom.roomNumber,
          bedType: selectedRoom.bedType,
          pricePerNight: selectedRoom.pricePerNight,
          numberOfNights: diffDays,
          totalCost: totalCost
        };

        console.log('Admin booking details to submit:', finalBookingDetails);
        alert(`Booking Confirmed for ${finalBookingDetails.guestName} at ${finalBookingDetails.hotelName}, Room ${finalBookingDetails.roomNumber}. Total Cost: $${finalBookingDetails.totalCost.toFixed(2)}`);

        // In a real application, you would send this 'finalBookingDetails' object
        // to your backend booking API using a service (e.g., this.bookingService.createBooking(...)).

        this.bookingForm.reset(); // Reset form after successful booking
        // Clear all validation errors and touched/pristine states
        Object.keys(this.bookingForm.controls).forEach(key => {
          this.bookingForm.get(key)?.setErrors(null);
          this.bookingForm.get(key)?.markAsUntouched();
          this.bookingForm.get(key)?.markAsPristine();
        });
        this.bookingForm.setErrors(null); // Clear form-level errors
        this.filterAvailableRooms(); // Re-filter rooms as form is reset
      }
    } else {
      this.bookingForm.markAllAsTouched(); // Mark all fields as touched to display validation errors
      console.error('Form is invalid. Please check the fields.');
      // Log specific errors for debugging
      Object.keys(this.bookingForm.controls).forEach(key => {
        const controlErrors = this.bookingForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Control: ' + key + ', Errors: ' + JSON.stringify(controlErrors));
        }
      });
      const formErrors = this.bookingForm.errors;
      if (formErrors) {
        console.log('Form-level errors:', JSON.stringify(formErrors));
      }
    }
  }
}
