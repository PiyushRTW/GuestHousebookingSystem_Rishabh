import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms'; // <-- Import AbstractControl
import { Hotel } from '../hotels/hotels.component'; // Adjust path if your Hotel interface is elsewhere

// Define the submission interface for clarity
export interface RoomConfigSubmission {
  hotelId: number | null;
  singleBedRoomsToAdd: number;
  doubleBedRoomsToAdd: number;
}

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  roomConfigForm!: FormGroup;
  hotels: Hotel[] = []; // List of hotels for the dropdown

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadMockHotels(); // Load mock hotels for the dropdown
    this.initForm();
  }

  // Initialize the reactive form
  initForm(): void {
    this.roomConfigForm = this.fb.group({
      hotelId: [null, Validators.required],
      singleBedRoomsToAdd: [0, [Validators.required, Validators.min(0)]],
      doubleBedRoomsToAdd: [0, [Validators.required, Validators.min(0)]]
    }, {
      // <-- IMPORTANT: Assign the validator here in the second argument of fb.group()
      // You can define it as a static method OR as an arrow function to preserve 'this' context,
      // but for a validator that doesn't need 'this', a static method is fine.
      validators: this.atLeastOneRoomValidator // Referencing the method
    });
  }

  // Define the custom validator as a method of the class
  // It receives an AbstractControl, but we know it will be a FormGroup in this context.
  atLeastOneRoomValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const formGroup = control as FormGroup; // Cast to FormGroup
    const single = formGroup.get('singleBedRoomsToAdd')?.value || 0;
    const double = formGroup.get('doubleBedRoomsToAdd')?.value || 0;

    return (single > 0 || double > 0) ? null : { noRoomsAdded: true };
  };

  // Simulate loading hotels (replace with HotelService in the future)
  loadMockHotels(): void {
    this.hotels = [
      {
        id: 1, name: 'Grand Plaza Hotel', address: 'City Center', description: 'Luxury hotel.',
        rating: 4
      },
      {
        id: 2, name: 'Riverside Inn', address: 'Near River', description: 'Cozy inn.',
        rating: 4
      },
      {
        id: 3, name: 'Mountain View Resort', address: 'Mountain Hills', description: 'Scenic resort.',
        rating: 5
      }
    ];
  }

  // Handle form submission
  onAddRooms(): void {
    // Manually update validity if using cross-field validators before checking form.valid
    // This is important because cross-field validators run less frequently by default.
    this.roomConfigForm.updateValueAndValidity();

    if (this.roomConfigForm.valid) {
      const roomConfig: RoomConfigSubmission = this.roomConfigForm.value;
      console.log('Room configuration to be submitted:', roomConfig);

      alert(`Adding ${roomConfig.singleBedRoomsToAdd} single rooms and ${roomConfig.doubleBedRoomsToAdd} double rooms to Hotel ID: ${roomConfig.hotelId}`);

      // Reset the form after successful submission
      this.roomConfigForm.reset({
        hotelId: null,
        singleBedRoomsToAdd: 0,
        doubleBedRoomsToAdd: 0
      });
      // Clear validation errors after reset
      Object.keys(this.roomConfigForm.controls).forEach(key => {
        this.roomConfigForm.get(key)?.setErrors(null);
        this.roomConfigForm.get(key)?.markAsUntouched(); // Also reset touched state
        this.roomConfigForm.get(key)?.markAsPristine();  // And pristine state
      });
      // For form-level error
      this.roomConfigForm.setErrors(null);
      this.roomConfigForm.markAsUntouched();
      this.roomConfigForm.markAsPristine();

    } else {
      this.roomConfigForm.markAllAsTouched();
      console.error('Form is invalid. Please check the fields.');
      Object.keys(this.roomConfigForm.controls).forEach(key => {
        const controlErrors = this.roomConfigForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Control: ' + key + ', Errors: ' + JSON.stringify(controlErrors));
        }
      });
      // Also log form-level errors
      const formErrors = this.roomConfigForm.errors;
      if (formErrors) {
        console.log('Form-level errors:', JSON.stringify(formErrors));
      }
    }
  }
}