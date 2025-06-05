import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AddEditHotelDialogComponent } from './add-edit-hotel-dialog/add-edit-hotel-dialog.component';
import { GuestHouseService, GuestHouseDTO } from '../../services/guesthouse/guest-house.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit {
  guestHouses: GuestHouseDTO[] = [];
  loading = false;
  error: string | null = null;
  deletingIds: Set<number> = new Set();

  constructor(
    private dialog: MatDialog,
    private guestHouseService: GuestHouseService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
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
        if (error.message === 'Authentication error') {
          this.snackBar.open('Your session has expired. Please login again.', 'Close', { duration: 5000 });
          this.authService.logout();
        } else {
          this.error = 'Failed to load guest houses. Please try again.';
        }
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
              if (error.message === 'Authentication error') {
                this.snackBar.open('Your session has expired. Please login again.', 'Close', { duration: 5000 });
                this.authService.logout();
              } else {
                this.snackBar.open('Error updating guest house', 'Close', { duration: 3000 });
              }
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
              if (error.message === 'Authentication error') {
                this.snackBar.open('Your session has expired. Please login again.', 'Close', { duration: 5000 });
                this.authService.logout();
              } else {
                this.snackBar.open('Error creating guest house', 'Close', { duration: 3000 });
              }
            }
          });
        }
      }
    });
  }

  deleteGuestHouse(id: number, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Guest House',
        message: `Are you sure you want to delete guest house "${name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.deletingIds.add(id);
        this.guestHouseService.deleteGuestHouse(id)
          .pipe(finalize(() => this.deletingIds.delete(id)))
          .subscribe({
            next: (success) => {
              if (success) {
                this.snackBar.open('Guest house deleted successfully', 'Close', { duration: 3000 });
                // Remove the deleted guest house from the local array
                this.guestHouses = this.guestHouses.filter(gh => gh.id !== id);
              } else {
                this.snackBar.open('Failed to delete guest house', 'Close', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error deleting guest house:', error);
              if (error.message === 'Authentication error') {
                this.snackBar.open('Your session has expired. Please login again.', 'Close', { duration: 5000 });
                this.authService.logout();
              } else {
                this.snackBar.open('Error deleting guest house. Please try again.', 'Close', { duration: 3000 });
              }
            }
          });
      }
    });
  }

  isDeleting(id: number): boolean {
    return this.deletingIds.has(id);
  }
}