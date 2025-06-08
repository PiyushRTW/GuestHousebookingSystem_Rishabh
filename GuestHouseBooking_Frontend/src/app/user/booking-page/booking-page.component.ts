import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GuestHouseService } from 'src/app/services/guesthouse/guest-house.service';
import { RoomService } from 'src/app/services/rooms/room.service';
import { BedService } from 'src/app/services/beds/bed.service';
import { BookingService } from 'src/app/services/bookings/booking.service';
import { Booking, BookingStatus } from 'src/app/shared/models/booking.model';
import { GuestHouse } from 'src/app/shared/models/guesthouse.model';
import { Room } from 'src/app/shared/models/room.model';
import { Bed } from 'src/app/shared/models/bed.model';

@Component({
    selector: 'app-booking-page',
    templateUrl: './booking-page.component.html',
    styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit, OnDestroy {
    bookingForm: FormGroup;
    isLoggedIn = true;
    guestHouses: GuestHouse[] = [];
    rooms: Room[] = [];
    beds: Bed[] = [];
    loading = true;
    guestHouseSubscription: Subscription;
    roomSubscription: Subscription;
    userId: number = 1; // This should come from your auth service
    today = new Date();
    selectedRoom: Room | null = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private snackBar: MatSnackBar,
        private guestHouseService: GuestHouseService,
        private roomService: RoomService,
        private bedService: BedService,
        private bookingService: BookingService
    ) {
        this.bookingForm = this.fb.group({
            arrivalDate: ['', Validators.required],
            departureDate: ['', Validators.required],
            guestHouse: ['', Validators.required],
            room: ['', this.roomValidator.bind(this)],
            bed: ['', this.bedValidator.bind(this)],
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            gender: ['', Validators.required],
            address: ['', Validators.required],
            purpose: ['', Validators.required]
        });
        this.guestHouseSubscription = new Subscription();
        this.roomSubscription = new Subscription();
    }

    ngOnInit() {
        this.loading = true;
        this.loadGuestHouses();
        this.initFormListeners();
    }

    loadGuestHouses() {
        this.guestHouseService.getAllGuestHouses().subscribe(
            (guestHouses) => {
                this.guestHouses = guestHouses;
                this.loading = false;
            },
            (error) => {
                console.error('Error loading guest houses:', error);
                this.snackBar.open('Error loading guest houses. Please try again.', 'Close', {
                    duration: 3000
                });
                this.loading = false;
            }
        );
    }

    ngOnDestroy() {
        this.guestHouseSubscription.unsubscribe();
        this.roomSubscription.unsubscribe();
    }

    initFormListeners() {
        const guestHouseControl = this.bookingForm.get('guestHouse');
        const roomControl = this.bookingForm.get('room');

        this.guestHouseSubscription = guestHouseControl?.valueChanges.subscribe(guestHouseId => {
            if (guestHouseId) {
                this.loadRooms(guestHouseId);
                this.bookingForm.get('room')?.setValue('');
                this.bookingForm.get('bed')?.setValue('');
                this.selectedRoom = null;
            }
        }) || new Subscription();

        this.roomSubscription = roomControl?.valueChanges.subscribe(roomId => {
            if (roomId) {
                this.loadBeds(roomId);
                this.bookingForm.get('bed')?.setValue('');
                this.selectedRoom = this.rooms.find(room => room.id === roomId) || null;
            } else {
                this.selectedRoom = null;
            }
        }) || new Subscription();
    }

    loadRooms(guestHouseId: number) {
        this.loading = true;
        this.roomService.getRoomsByGuestHouseId(guestHouseId).subscribe(
            (rooms) => {
                this.rooms = rooms.map(room => ({
                    ...room,
                    guestHouseId: guestHouseId,
                    description: room.description || '',
                    amenities: room.amenities || '',
                    imageUrl: room.imageUrl || '',
                    createdAt: room.createdAt ? new Date(room.createdAt) : undefined,
                    updatedAt: room.updatedAt ? new Date(room.updatedAt) : undefined
                }));
                this.loading = false;
            },
            (error) => {
                console.error('Error loading rooms:', error);
                this.snackBar.open('Error loading rooms. Please try again.', 'Close', {
                    duration: 3000
                });
                this.loading = false;
            }
        );
    }

    loadBeds(roomId: number) {
        this.loading = true;
        this.bedService.getBedsByRoomId(roomId).subscribe(
            (beds) => {
                this.beds = beds.map(bed => ({
                    ...bed,
                    id: bed.id || 0,
                    room: this.selectedRoom!,
                    isAvailableForBooking: bed.isAvailableForBooking
                }));
                this.loading = false;
            },
            (error) => {
                console.error('Error loading beds:', error);
                this.snackBar.open('Error loading beds. Please try again.', 'Close', {
                    duration: 3000
                });
                this.loading = false;
            }
        );
    }

    roomValidator(control: FormControl) {
        const guestHouseControl = control.parent?.get('guestHouse');
        if (guestHouseControl && guestHouseControl.value) {
            return Validators.required(control);
        }
        return null;
    }

    bedValidator(control: FormControl) {
        const roomControl = control.parent?.get('room');
        if (roomControl && roomControl.value) {
            return Validators.required(control);
        }
        return null;
    }

    calculateNumberOfNights(): number {
        const arrivalDate = this.bookingForm.get('arrivalDate')?.value;
        const departureDate = this.bookingForm.get('departureDate')?.value;
        if (arrivalDate && departureDate) {
            return Math.ceil((new Date(departureDate).getTime() - new Date(arrivalDate).getTime()) / (1000 * 60 * 60 * 24));
        }
        return 0;
    }

    calculateTotalAmount(): number {
        const selectedBed = this.beds.find(bed => bed.id === this.bookingForm.get('bed')?.value) as Bed;
        if (selectedBed && this.bookingForm.get('arrivalDate')?.value && this.bookingForm.get('departureDate')?.value) {
            return this.calculateNumberOfNights() * selectedBed.pricePerNight;
        }
        return 0;
    }

    onSubmit() {
        if (this.bookingForm.valid) {
            const formValue = this.bookingForm.value;
            
            if (!this.selectedRoom) {
                this.snackBar.open('Error: Room not found', 'Close', { duration: 3000 });
                return;
            }

            const booking: Booking = {
                userId: this.userId,
                bedId: formValue.bed,
                firstName: formValue.fullName.split(' ')[0],
                lastName: formValue.fullName.split(' ')[1],
                email: formValue.email,
                phoneNumber: formValue.phoneNumber,
                gender: formValue.gender,
                address: formValue.address,
                checkInDate: formValue.arrivalDate,
                checkOutDate: formValue.departureDate,
                totalPrice: this.calculateTotalAmount(),
                status: BookingStatus.PENDING,
                purpose: formValue.purpose
            };

            this.loading = true;
            this.bookingService.createBooking(booking).subscribe(
                (response) => {
                    this.snackBar.open('Booking created successfully!', 'Close', {
                        duration: 3000
                    });
                    this.router.navigate(['/user/booking-confirmation'], {
                        state: { booking: response }
                    });
                },
                (error) => {
                    console.error('Error creating booking:', error);
                    this.snackBar.open('Error creating booking. Please try again.', 'Close', {
                        duration: 3000
                    });
                    this.loading = false;
                }
            );
        } else {
            this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
                duration: 3000
            });
        }
    }
}