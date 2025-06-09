import { Component, OnInit } from '@angular/core';
import { GuestHouseService } from 'src/app/services/guesthouse/guest-house.service';
import { GuestHouse } from 'src/app/shared/models/guesthouse.model';
import { RoomService } from 'src/app/services/rooms/room.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Room } from 'src/app/shared/models/room.model';
import { Bed } from 'src/app/shared/models/bed.model';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  guestHouses: (GuestHouse & { totalRooms: number; availableBeds: number })[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private guestHouseService: GuestHouseService,
    private roomService: RoomService,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadGuestHouses();
  }

  loadGuestHouses(): void {
    this.loading = true;
    this.error = null;
    
    this.guestHouseService.getAllGuestHouses()
      .subscribe({
        next: (guestHouses) => {
          const roomAndBedObservables = guestHouses.map(guestHouse => 
            this.roomService.getRoomsByGuestHouseId(guestHouse.id!).pipe(
              map(rooms => {
                const totalRooms = rooms.length;
                const availableBeds = rooms.reduce((total, room) => {
                  if (room.beds) {
                    return total + room.beds.filter(bed => bed.isAvailableForBooking).length;
                  }
                  return total;
                }, 0);
                return { ...guestHouse, totalRooms, availableBeds };
              }),
              catchError(error => {
                console.error(`Error fetching rooms for guest house ${guestHouse.id}:`, error);
                return of({ ...guestHouse, totalRooms: 0, availableBeds: 0 });
              })
            )
          );

          forkJoin(roomAndBedObservables).subscribe({
            next: (guestHousesWithDetails) => {
              this.guestHouses = guestHousesWithDetails;
              this.loading = false;
            },
            error: (error) => {
              console.error('Error fetching room and bed details:', error);
              this.error = 'Failed to load room information. Please try again later.';
              this.loading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error fetching guest houses:', error);
          if (error.status === 401 || error.status === 403) {
            this.error = 'Authentication error. Please log in again.';
            this.authService.logout();
            this.router.navigate(['/login']);
          } else {
            this.error = 'Failed to load guest houses. Please try again later.';
          }
          this.loading = false;
        }
      });
  }

  onGuestHouseSelect(guestHouse: GuestHouse & { totalRooms: number; availableBeds: number }): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to make a booking', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
      // Store the guest house ID in session storage for redirect after login
      sessionStorage.setItem('pendingBookingGuestHouseId', guestHouse.id!.toString());
      this.router.navigate(['/login']);
      return;
    }

    if (guestHouse.availableBeds === 0) {
      this.snackBar.open('No beds available in this guest house', 'Close', {
        duration: 5000
      });
      return;
    }

    this.router.navigate(['/user/booking-page'], {
      queryParams: { 
        guestHouseId: guestHouse.id,
        guestHouseName: guestHouse.name
      }
    }).catch(error => {
      console.error('Navigation error:', error);
      this.snackBar.open('Error navigating to booking page. Please try again.', 'Close', {
        duration: 5000
      });
    });
  }
}