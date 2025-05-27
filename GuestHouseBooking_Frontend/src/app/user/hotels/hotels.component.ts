import { Component, OnInit } from '@angular/core';
import { GuestHouseService } from 'src/app/services/guesthouse/guest-house.service';
import { GuestHouse } from '../../shared/models/guesthouse.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  guestHouses: GuestHouse[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private guestHouseService: GuestHouseService,
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
          this.guestHouses = guestHouses;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching guest houses:', error);
          this.error = 'Failed to load guest houses. Please try again later.';
          this.loading = false;
        }
      });
  }

  onGuestHouseSelect(guestHouse: GuestHouse): void {
    // Navigate to booking page with guest house ID
    this.router.navigate(['/user/booking'], { 
      queryParams: { guestHouseId: guestHouse.id }
    });
  }
}