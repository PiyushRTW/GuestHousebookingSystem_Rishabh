import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddEditHotelDialogComponent } from './add-edit-hotel-dialog/add-edit-hotel-dialog.component';
import { GuestHouseService, GuestHouseDTO } from '../../services/guesthouse/guest-house.service';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  guestHouses: GuestHouseDTO[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private dialog: MatDialog,
    private guestHouseService: GuestHouseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadGuestHouses();
  }

  loadGuestHouses(): void {
    this.loading = true;
    this.error = null;
    this.guestHouseService.getAllGuestHouses().subscribe({
      next: (guestHouses) => {
        this.guestHouses = guestHouses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading guest houses:', error);
        this.error = 'Failed to load guest houses. Please try again.';
        this.loading = false;
      }
    });
  }

  openAddEditDialog(guestHouse?: GuestHouseDTO): void {
    const dialogRef = this.dialog.open(AddEditHotelDialogComponent, {
      width: '600px',
      data: guestHouse || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // Update existing guest house
          this.guestHouseService.updateGuestHouse(result.id, result).subscribe({
            next: () => {
              this.snackBar.open('Guest house updated successfully', 'Close', { duration: 3000 });
              this.loadGuestHouses();
            },
            error: (error) => {
              console.error('Error updating guest house:', error);
              this.snackBar.open('Error updating guest house', 'Close', { duration: 3000 });
            }
          });
        } else {
          // Create new guest house
          this.guestHouseService.createGuestHouse(result).subscribe({
            next: () => {
              this.snackBar.open('Guest house created successfully', 'Close', { duration: 3000 });
              this.loadGuestHouses();
            },
            error: (error) => {
              console.error('Error creating guest house:', error);
              this.snackBar.open('Error creating guest house', 'Close', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  deleteGuestHouse(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete guest house "${name}"?`)) {
      this.guestHouseService.deleteGuestHouse(id).subscribe({
        next: () => {
          this.snackBar.open('Guest house deleted successfully', 'Close', { duration: 3000 });
          this.loadGuestHouses();
        },
        error: (error) => {
          console.error('Error deleting guest house:', error);
          this.snackBar.open('Error deleting guest house', 'Close', { duration: 3000 });
        }
      });
    }
  }
}