import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-booking-page',
    templateUrl: './booking-page.component.html',
    styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit, OnDestroy {
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
    private destroy$ = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private bookingService: BookingService,
        private guestHouseService: GuestHouseService,
        private roomService: RoomService,
        private bedService: BedService,
        private snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadGuestHouses();
        this.setupFormListeners();

        // Check for guestHouseId in query params
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                if (params['guestHouseId']) {
                    const guestHouseId = Number(params['guestHouseId']);
                    this.bookingForm.patchValue({ guestHouseId });
                    
                    // Load rooms for this guest house
                    this.loadAvailableRooms(guestHouseId);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    initForm(): void {
        const currentUser = this.authService.currentUserValue;
        this.bookingForm = this.fb.group({
            // Guest Information
            firstName: [currentUser?.firstName || '', Validators.required],
            lastName: [currentUser?.lastName || '', Validators.required],
            email: [currentUser?.email || '', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
            gender: ['', Validators.required],
            address: ['', Validators.required],

            // Booking Details
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
        this.guestHouseService.getAllGuestHouses()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (guestHouses) => {
                    this.guestHouses = guestHouses;
                    this.isLoading = false;
                },
                error: (error) => {
                    this.handleError(error, 'Error loading guest houses');
                }
            });
    }

    setupFormListeners(): void {
        // Guest House selection listener
        this.bookingForm.get('guestHouseId')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(guestHouseId => {
                if (guestHouseId) {
                    this.loadAvailableRooms(guestHouseId);
                    this.bookingForm.patchValue({ roomId: null, bedId: null });
                }
            });

        // Room selection listener
        this.bookingForm.get('roomId')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(roomId => {
                if (roomId) {
                    this.loadAvailableBeds(roomId);
                    this.bookingForm.patchValue({ bedId: null });
                }
            });

        // Bed selection listener
        this.bookingForm.get('bedId')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(bedId => {
                if (bedId) {
                    this.loadBedDetails(bedId);
                }
            });

        // Date change listeners
        this.bookingForm.get('checkInDate')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.updatePriceCalculation();
                if (this.bookingForm.get('roomId')?.value) {
                    this.loadAvailableBeds(this.bookingForm.get('roomId')?.value);
                }
            });

        this.bookingForm.get('checkOutDate')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.updatePriceCalculation();
                if (this.bookingForm.get('roomId')?.value) {
                    this.loadAvailableBeds(this.bookingForm.get('roomId')?.value);
                }
            });
    }

    loadAvailableRooms(guestHouseId: number): void {
        this.isLoading = true;
        this.roomService.getRoomsByGuestHouseId(guestHouseId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (rooms) => {
                    this.availableRooms = rooms;
                    this.isLoading = false;
                },
                error: (error) => {
                    if (error.status === 404) {
                        this.availableRooms = [];
                        this.snackBar.open('No rooms available for this guest house', 'Close', { duration: 3000 });
                    } else {
                        this.handleError(error, 'Error loading rooms');
                    }
                    this.isLoading = false;
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
        this.bedService.getAvailableBeds(roomId, checkIn, checkOut)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (beds) => {
                    this.availableBeds = beds;
                    this.isLoading = false;
                },
                error: (error) => {
                    if (error.status === 404) {
                        this.availableBeds = [];
                        this.snackBar.open('No beds available for the selected dates', 'Close', { duration: 3000 });
                    } else {
                        this.handleError(error, 'Error loading available beds');
                    }
                    this.isLoading = false;
                }
            });
    }

    loadBedDetails(bedId: number): void {
        this.bedService.getBedById(bedId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
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
        return guestControls.every(control => this.bookingForm.get(control)?.valid);
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
                status: BookingStatus.PENDING,
                totalPrice: this.totalPrice,
                numberOfNights: this.numberOfNights
            };

            this.bookingService.createBooking(bookingData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.bookingConfirmed = true;
                        this.isLoading = false;
                        this.snackBar.open('Booking confirmed successfully!', 'Close', { duration: 5000 });
                        this.router.navigate(['/user/my-bookings']);
                    },
                    error: (error) => {
                        this.handleError(error, 'Error confirming booking');
                        this.isLoading = false;
                    }
                });
        } else {
            this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
        }
    }

    private handleError(error: any, message: string): void {
        console.error(error);
        let errorMessage = message;
        
        if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
            errorMessage = 'Session expired. Please login again.';
        } else if (error.error?.message) {
            errorMessage += ': ' + error.error.message;
        } else {
            errorMessage += '. Please try again.';
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.isLoading = false;
    }

    resetForm(): void {
        this.bookingForm.reset();
        this.selectedBed = null;
        this.numberOfNights = 0;
        this.totalPrice = 0;
        this.bookingConfirmed = false;
        this.stepper.reset();
    }
}