import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Assuming Angular Material for dialogs
import { AddEditHotelDialogComponent } from './add-edit-hotel-dialog/add-edit-hotel-dialog.component';
import { ConfirmDialogData, ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

// Define a simple interface for a Hotel (you can expand this)
export interface Hotel {
  id: number;
  name: string;
  address: string;
  description: string;
  rating: number;
  imageUrl?: string;
  
  // Add other properties like images, rooms, etc.
}

// Define a structure for the room configuration submission
export interface RoomConfigSubmission {
  hotelId: number | null;
  singleBedRoomsToAdd: number;
  doubleBedRoomsToAdd: number;
}

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  hotels: Hotel[] = []; // Array to hold our hotel data

  constructor(private dialog: MatDialog) { } // Inject MatDialog service

  ngOnInit(): void {
    // In a real application, you would fetch hotels from a service here
    this.loadHotels();
  }

  loadHotels(): void {
    // Simulate fetching data from a backend
    // In a real app: this.hotelService.getHotels().subscribe(data => this.hotels = data);
    this.hotels = [
      {
        id: 1, name: 'Grand Hyatt', address: 'New York', description: 'Luxury hotel in the heart of the city.',
        rating: 3.5
      },
      {
        id: 2, name: 'Beachfront Resort', address: 'Maldives', description: 'Stunning resort with ocean views.',
        rating: 4.5
      },
      {
        id: 3, name: 'Mountain Retreat', address: 'Swiss Alps', description: 'Cozy retreat for nature lovers.',
        rating: 4.7
      }
    ];
    console.log('Hotels loaded:', this.hotels);
  }

  /**
   * Opens the add/edit hotel dialog.
   * @param hotel The hotel object to edit, or undefined for adding a new hotel.
   */
  openAddEditDialog(hotel?: Hotel): void {
    const dialogRef = this.dialog.open(AddEditHotelDialogComponent, {
      width: '600px', // Set a suitable width for your dialog
      data: hotel // Pass the hotel object if editing, or undefined if adding
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      if (result) {
        // If result exists, it means the dialog returned data (e.g., a new/updated hotel)
        if (hotel && hotel.id) {
          // If a hotel was passed, it's an edit operation
          // In a real app: this.hotelService.updateHotel(result).subscribe(() => this.loadHotels());
          const index = this.hotels.findIndex(h => h.id === result.id);
          if (index > -1) {
            this.hotels[index] = result; // Update the existing hotel in our local array
          }
        } else {
          // It's an add operation
          // In a real app: this.hotelService.addHotel(result).subscribe(() => this.loadHotels());
          // Assign a temporary ID for demonstration if adding
          result.id = this.hotels.length ? Math.max(...this.hotels.map(h => h.id)) + 1 : 1;
          this.hotels.push(result); // Add the new hotel to our local array
        }
        this.loadHotels(); // Re-load or refresh the list (or update locally more efficiently)
      }
    });
  }

  /**
   * Handles the deletion of a hotel.
   * @param hotelId The ID of the hotel to delete.
   */
   deleteHotel(hotelId: number, hotelName: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${hotelName}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px', // Set a suitable width
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) { // User confirmed deletion
        // In a real app: this.hotelService.deleteHotel(hotelId).subscribe(() => this.loadHotels());
        this.hotels = this.hotels.filter(hotel => hotel.id !== hotelId);
        console.log(`Hotel with ID ${hotelId} (${hotelName}) deleted.`);
      } else {
        console.log('Hotel deletion cancelled.');
      }
    });
  }
}