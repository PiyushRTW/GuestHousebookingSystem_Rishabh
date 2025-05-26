import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

interface GuestHouse {
    id: number;
    name: string;
}

interface Room {
    id: number;
    name: number;
    guestHouseId: number;
}

interface Bed {
    id: number;
    name: string;
    roomId: number;
}

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

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.bookingForm = this.fb.group({
            arrivalDate: ['', Validators.required],
            departureDate: ['', Validators.required],
            guestHouse: ['', Validators.required],
            room: ['', this.roomValidator.bind(this)],
            bed: ['', this.bedValidator.bind(this)],
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required]
        });
        this.guestHouseSubscription = new Subscription();
        this.roomSubscription = new Subscription();
    }

    ngOnInit() {
        this.loading = true;
        of(null)
            .pipe(delay(1000))
            .subscribe(() => {
                this.guestHouses = [
                    { id: 1, name: 'Guest House A' },
                    { id: 2, name: 'Guest House B' },
                    { id: 3, name: 'Guest House C' }
                ];
                this.rooms = [
                    { id: 101, name: 101, guestHouseId: 1 },
                    { id: 102, name: 102, guestHouseId: 1 },
                    { id: 201, name: 201, guestHouseId: 2 },
                    { id: 202, name: 202, guestHouseId: 2 },
                    { id: 301, name: 301, guestHouseId: 3 },
                    { id: 302, name: 302, guestHouseId: 3 },
                ];
                this.beds = [
                    { id: 1, name: 'Bed 1', roomId: 101 },
                    { id: 2, name: 'Bed 2', roomId: 101 },
                    { id: 3, name: 'Bed 1', roomId: 102 },
                    { id: 4, name: 'Bed 2', roomId: 102 },
                    { id: 5, name: 'Bed 1', roomId: 201 },
                    { id: 6, name: 'Bed 2', roomId: 201 },
                    { id: 7, name: 'Bed 1', roomId: 202 },
                    { id: 8, name: 'Bed 2', roomId: 202 },
                    { id: 9, name: 'Bed 1', roomId: 301 },
                    { id: 10, name: 'Bed 2', roomId: 301 },
                    { id: 11, name: 'Bed 1', roomId: 302 },
                    { id: 12, name: 'Bed 2', roomId: 302 },
                ];
                this.loading = false;
                this.initFormListeners();
            });
    }

    ngOnDestroy() {
        this.guestHouseSubscription.unsubscribe();
        this.roomSubscription.unsubscribe();
    }

    initFormListeners() {
        const guestHouseControl = this.bookingForm.get('guestHouse');
        const roomControl = this.bookingForm.get('room');

        this.guestHouseSubscription = guestHouseControl ? guestHouseControl.valueChanges.subscribe(guestHouseId => {
            this.populateRooms(guestHouseId);
            this.bookingForm.get('room')?.setValue('');
            this.bookingForm.get('room')?.updateValueAndValidity();
            this.populateBeds(0);
            this.bookingForm.get('bed')?.setValue('');
            this.bookingForm.get('bed')?.updateValueAndValidity();
        }) : new Subscription();


        this.roomSubscription = roomControl ? roomControl.valueChanges.subscribe(roomId => {
            this.populateBeds(roomId);
            this.bookingForm.get('bed')?.setValue('');
            this.bookingForm.get('bed')?.updateValueAndValidity();
        }) : new Subscription();
    }

    populateRooms(guestHouseId: number ) {
        this.rooms = this.getRoomsByGuestHouse(guestHouseId);
    }

    populateBeds(roomId: number) {
        this.beds = this.getBedsByRoom(roomId);
    }

    getRoomsByGuestHouse(guestHouseId: number): Room[] {
        return this.rooms.filter(room => room.guestHouseId === guestHouseId);
    }

    getBedsByRoom(roomId: number): Bed[] {
        return this.beds.filter(bed => bed.roomId === roomId);
    }

    roomValidator(control: FormControl) {
        const guestHouseControl = control.parent?.get('guestHouse');
        if (guestHouseControl && guestHouseControl.value && this.getRoomsByGuestHouse(guestHouseControl.value).length > 0) {
            return Validators.required(control);
        }
        return null;
    }

    bedValidator(control: FormControl) {
        const roomControl = control.parent?.get('room');
        if (roomControl && roomControl.value && this.getBedsByRoom(roomControl.value).length > 0) {
            return Validators.required(control);
        }
        return null;
    }

    onSubmit() {
        if (this.bookingForm.valid) {
            console.log('Booking Form Data:', this.bookingForm.value);
            this.snackBar.open('Your booking request has been submitted!', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
            this.router.navigate(['/user/booking-confirmation']);
        } else {
            this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
            });
        }
    }
}