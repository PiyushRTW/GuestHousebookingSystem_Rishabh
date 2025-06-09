import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { GuestHouse } from '../../shared/models/guesthouse.model';
import { Room } from '../../shared/models/room.model';
import { Bed } from '../../shared/models/bed.model';
import { BookingService } from 'src/app/services/bookings/booking.service';
import { GuestHouseService } from 'src/app/services/guesthouse/guest-house.service';
import { RoomService } from 'src/app/services/rooms/room.service';
import { BedService } from 'src/app/services/beds/bed.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { BookingStatus } from 'src/app/shared/models/booking.model';

@Component({
  selector: 'app-admin-booking',
  templateUrl: './admin-booking.component.html',
  styleUrls: ['./admin-booking.component.scss']
})
export class AdminBookingComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  bookingForm!: FormGroup;
  guestHouses: GuestHouse[] = [];
  availableRooms: Room[] = [];
  availableBeds: Bed[] = [];
  selectedBed: Bed | null = null;
  numberOfNights: number = 0;
  totalPrice: number = 0;
  bookingConfirmed: boolean = false;
  isLoading: boolean = false;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private guestHouseService: GuestHouseService,
    private roomService: RoomService,
    private bedService: BedService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadGuestHouses();
    this.setupFormListeners();
  }

  initForm(): void {
    this.bookingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      gender: ['', Validators.required],
      address: ['', Validators.required],

      guestHouseId: [null, Validators.required],
      roomId: [null, Validators.required],
      bedId: [null, Validators.required],
      checkInDate: [null, [Validators.required, this.pastDateValidator()]],
      checkOutDate: [null, [Validators.required, this.pastDateValidator()]],
      purpose: [''],
    }, {
      validators: this.dateRangeValidator
    });
  }

  pastDateValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(control.value);
      return inputDate < today ? { pastDate: true } : null;
    };
  }

  dateRangeValidator(group: FormGroup) {
    const checkIn = group.get('checkInDate')?.value;
    const checkOut = group.get('checkOutDate')?.value;

    if (!checkIn || !checkOut) return null;

    return checkIn < checkOut ? null : { invalidDateRange: true };
  }

  loadGuestHouses(): void {
    this.isLoading = true;
    console.log('Loading guest houses...');
    this.guestHouseService.getAllGuestHouses().subscribe({
      next: (guestHouses) => {
        this.guestHouses = guestHouses.map(gh => ({
          id: gh.id || 0,
          name: gh.name,
          address: gh.address,
          city: gh.city,
          state: gh.state,
          country: gh.country,
          description: gh.description || '',
          amenities: gh.amenities || '',
          contactNumber: gh.contactNumber || '',
          email: gh.email || '',
          imageUrl: gh.imageUrl || '',
          rooms: []
        }));
        console.log('Guest houses loaded:', this.guestHouses);
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error, 'Error loading guest houses');
      }
    });
  }

  setupFormListeners(): void {
    this.bookingForm.get('guestHouseId')?.valueChanges.subscribe(guestHouseId => {
      if (guestHouseId) {
        this.loadAvailableRooms(guestHouseId);
        this.bookingForm.patchValue({ roomId: null, bedId: null });
      }
    });

    this.bookingForm.get('roomId')?.valueChanges.subscribe(roomId => {
      if (roomId) {
        this.loadAvailableBeds(roomId);
        this.bookingForm.patchValue({ bedId: null });
      }
    });

    this.bookingForm.get('bedId')?.valueChanges.subscribe(bedId => {
      if (bedId) {
        this.loadBedDetails(bedId);
      }
    });

    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => this.updatePriceCalculation());
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => this.updatePriceCalculation());
  }

  loadAvailableRooms(guestHouseId: number): void {
    this.isLoading = true;
    this.roomService.getRoomsByGuestHouseId(guestHouseId).subscribe({
      next: (rooms) => {
        this.availableRooms = rooms.map(room => ({
          id: room.id || 0,
          roomNumber: room.roomNumber,
          description: room.description || '',
          amenities: room.amenities || '',
          imageUrl: room.imageUrl || '',
          guestHouse: this.guestHouses.find(gh => gh.id === guestHouseId) || this.guestHouses[0],
          beds: []
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error, 'Error loading rooms');
      }
    });
  }

  loadAvailableBeds(roomId: number): void {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    if (!checkIn || !checkOut) {
      this.snackBar.open('Please select check-in and check-out dates first', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.bedService.getAvailableBeds(roomId, checkIn, checkOut).subscribe({
      next: (beds) => {
        this.availableBeds = beds;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(error, 'Error loading available beds');
      }
    });
  }

  loadBedDetails(bedId: number): void {
    this.bedService.getBedById(bedId).subscribe({
      next: (bed) => {
        this.selectedBed = bed;
        this.updatePriceCalculation();
      },
      error: (error) => {
        this.handleError(error, 'Error loading bed details');
      }
    });
  }

  updatePriceCalculation(): void {
    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;
    
    if (this.selectedBed && checkIn && checkOut) {
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      this.numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      this.totalPrice = this.numberOfNights * this.selectedBed.pricePerNight;
    }
  }

  isGuestInfoValid(): boolean {
    const guestControls = ['firstName', 'lastName', 'email', 'phoneNumber', 'gender', 'address'];
    const isValid = guestControls.every(control => this.bookingForm.get(control)?.valid);
    console.log('Guest info validation:', isValid);
    if (!isValid) {
      const invalidControls = guestControls.filter(control => !this.bookingForm.get(control)?.valid);
      console.log('Invalid controls:', invalidControls);
    }
    return isValid;
  }

  isBookingValid(): boolean {
    const bookingControls = ['guestHouseId', 'roomId', 'bedId', 'checkInDate', 'checkOutDate'];
    return bookingControls.every(control => this.bookingForm.get(control)?.valid);
  }

  confirmBooking(): void {
    if (this.bookingForm.valid) {
      this.isLoading = true;
      const currentUser = this.authService.currentUserValue;
      
      const bookingData = {
        ...this.bookingForm.value,
        userId: currentUser?.id,
        status: BookingStatus.CONFIRMED,
        totalPrice: this.totalPrice,
        createdBy: currentUser?.username || 'admin'
      };

      console.log('Sending booking data:', bookingData);

      this.bookingService.createBooking(bookingData).subscribe({
        next: (response) => {
          this.bookingConfirmed = true;
          this.isLoading = false;
          this.stepper.next();
          this.snackBar.open('Booking confirmed successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Booking error:', error);
          this.snackBar.open(`Error creating booking: ${error.error?.message || error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
        }
      });
    }
  }

  resetForm(): void {
    this.bookingForm.reset();
    this.selectedBed = null;
    this.numberOfNights = 0;
    this.totalPrice = 0;
    this.bookingConfirmed = false;
    this.stepper.reset();
  }

  private handleError(error: any, message: string) {
    console.error(message, error);
    if (error.status === 403 || error.status === 401) {
      this.snackBar.open('Your session has expired. Please login again.', 'Close', { duration: 5000 });
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    } else {
      this.snackBar.open(message, 'Close', { duration: 3000 });
    }
    this.isLoading = false;
  }
}
