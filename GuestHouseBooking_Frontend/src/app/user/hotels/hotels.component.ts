import { Component, OnInit } from '@angular/core';
import { GuestHouseService, GuestHouseDTO } from 'src/app/services/guesthouse/guest-house.service';
import { RoomService } from 'src/app/services/rooms/room.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  guestHouses: (GuestHouseDTO & { totalRooms: number })[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private guestHouseService: GuestHouseService,
    private roomService: RoomService,
    private router: Router
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
          // Create an array of room count observables for each guest house
          const roomCountObservables = guestHouses.map(guestHouse => 
            this.roomService.getRoomsByGuestHouse(guestHouse.id!).pipe(
              map(rooms => ({ ...guestHouse, totalRooms: rooms.length })),
              catchError(() => of({ ...guestHouse, totalRooms: 0 }))
            )
          );

          // Wait for all room count requests to complete
          forkJoin(roomCountObservables).subscribe({
            next: (guestHousesWithRooms) => {
              this.guestHouses = guestHousesWithRooms;
              this.loading = false;
            },
            error: (error) => {
              console.error('Error fetching room counts:', error);
              this.error = 'Failed to load guest houses. Please try again later.';
              this.loading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error fetching guest houses:', error);
          this.error = 'Failed to load guest houses. Please try again later.';
          this.loading = false;
        }
      });
  }

  onGuestHouseSelect(guestHouse: GuestHouseDTO & { totalRooms: number }): void {
    // Navigate to booking page with guest house ID
    this.router.navigate(['/user/booking-page'], {
      queryParams: { guestHouseId: guestHouse.id }
    });
  }
}