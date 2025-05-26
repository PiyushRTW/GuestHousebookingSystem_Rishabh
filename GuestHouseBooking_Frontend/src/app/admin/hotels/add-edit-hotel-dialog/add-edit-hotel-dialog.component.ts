import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Hotel } from '../hotels.component'; // Import the Hotel interface

@Component({
  selector: 'app-add-edit-hotel-dialog',
  templateUrl: './add-edit-hotel-dialog.component.html',
  styleUrls: ['./add-edit-hotel-dialog.component.scss']
})
export class AddEditHotelDialogComponent implements OnInit {
  hotelForm!: FormGroup; // Our reactive form group
  isEditMode: boolean = false; // To determine if we are adding or editing

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddEditHotelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Hotel | null // Inject data passed to the dialog
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data; // If data exists, it's edit mode

    this.hotelForm = this.fb.group({
      id: [this.data ? this.data.id : null], // Hidden ID field for edit operations
      name: [this.data ? this.data.name : '', Validators.required],
      location: [this.data ? this.data.address : '', Validators.required],
      description: [this.data ? this.data.description : '', Validators.required],
      // Add more form controls for other hotel properties (e.g., imageUrl, rating, rooms)
      // For example:
      // imageUrl: [this.data ? this.data.imageUrl : ''],
      // rating: [this.data ? this.data.rating : 0, [Validators.min(0), Validators.max(5)]]
    });
  }

  onSave(): void {
    if (this.hotelForm.valid) {
      // Pass the form value back to the component that opened the dialog
      this.dialogRef.close(this.hotelForm.value);
    } else {
      // Mark all fields as touched to display validation errors
      this.hotelForm.markAllAsTouched();
      console.log('Form is invalid. Please check the fields.');
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Close the dialog without passing any data
  }
}