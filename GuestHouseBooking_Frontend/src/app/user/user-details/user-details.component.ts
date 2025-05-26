import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
}

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  userProfileForm: FormGroup;
  isLoading: boolean = true;
  isEditing: boolean = false;
  initialProfileData: UserProfile | null = null; // To store original data for comparison

  constructor(private fb: FormBuilder) {
    this.userProfileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['']
      // Add form controls for other editable fields
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    // In a real application, you would call a service here to fetch
    // the logged-in user's profile data.
    // this.userService.getUserProfile().subscribe(data => {
    //   this.initialProfileData = data;
    //   this.userProfileForm.patchValue(data);
    //   this.isLoading = false;
    // });

    // Placeholder static data for now:
    setTimeout(() => {
      this.initialProfileData = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '9876543210',
        address: '123 Main Street, Anytown'
      };
      this.userProfileForm.patchValue(this.initialProfileData);
      this.isLoading = false;
    }, 1000);
  }

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    // Revert the form to the initial data
    if (this.initialProfileData) {
      this.userProfileForm.patchValue(this.initialProfileData);
    }
  }

  saveChanges() {
    if (this.userProfileForm.valid) {
      this.isEditing = false;
      const updatedProfileData = this.userProfileForm.value;
      console.log('Updated Profile Data:', updatedProfileData);
      // In a real application, you would call a service here to update
      // the user's profile data on the backend.
      // this.userService.updateUserProfile(updatedProfileData).subscribe(response => {
      //   // Handle success feedback
      // });
    } else {
      // Display validation errors
      alert('Please ensure all required fields are filled correctly.');
    }
  }
}