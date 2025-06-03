import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GuestHouse } from '../../../shared/models/guesthouse.model';

@Component({
  selector: 'app-add-edit-hotel-dialog',
  templateUrl: './add-edit-hotel-dialog.component.html',
  styleUrls: ['./add-edit-hotel-dialog.component.scss']
})
export class AddEditHotelDialogComponent implements OnInit {
  guestHouseForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddEditHotelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GuestHouse | null
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.initForm();
  }

  private initForm(): void {
    this.guestHouseForm = this.fb.group({
      id: [this.data?.id],
      name: [this.data?.name || '', [Validators.required]],
      address: [this.data?.address || '', [Validators.required]],
      city: [this.data?.city || '', [Validators.required]],
      state: [this.data?.state || '', [Validators.required]],
      country: [this.data?.country || '', [Validators.required]],
      description: [this.data?.description || ''],
      amenities: [this.data?.amenities || ''],
      contactNumber: [this.data?.contactNumber || '', [Validators.required]],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      imageUrl: [this.data?.imageUrl || '']
    });
  }

  onSubmit(): void {
    if (this.guestHouseForm.valid) {
      this.dialogRef.close(this.guestHouseForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}