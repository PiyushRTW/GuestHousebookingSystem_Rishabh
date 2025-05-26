// Define a simple interface for mock booking logs
export interface BookingLog {
  id: number;
  checkInDate: Date; // Use Date objects for easier comparison
  checkOutDate: Date;
  revenue: number;
  guestId: number; // For counting unique guests
  guestName: string; // For display/identification
}

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms'; // Import FormBuilder, FormGroup, and ValidatorFn

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Overall statistics (can remain static for now or be fetched globally)
  totalHotels: number = 5;
  totalRooms: number = 120;
  totalBookings: number = 75;
  pendingBookings: number = 10;

  // Form group for date range selection
  dateRangeForm!: FormGroup;

  // Period-specific statistics
  periodRevenue: number = 0;
  periodGuestsVisited: number = 0;
  periodCheckIns: number = 0;
  periodCheckOuts: number = 0;

  // Mock booking log data
  // In a real app, this would come from a backend service
  mockBookingLogs: BookingLog[] = [
    { id: 1, checkInDate: new Date('2024-01-05'), checkOutDate: new Date('2024-01-10'), revenue: 500, guestId: 101, guestName: 'Alice' },
    { id: 2, checkInDate: new Date('2024-01-12'), checkOutDate: new Date('2024-01-15'), revenue: 300, guestId: 102, guestName: 'Bob' },
    { id: 3, checkInDate: new Date('2024-02-01'), checkOutDate: new Date('2024-02-05'), revenue: 450, guestId: 101, guestName: 'Alice' }, // Alice visits again
    { id: 4, checkInDate: new Date('2024-02-10'), checkOutDate: new Date('2024-02-12'), revenue: 200, guestId: 103, guestName: 'Charlie' },
    { id: 5, checkInDate: new Date('2024-03-01'), checkOutDate: new Date('2024-03-03'), revenue: 250, guestId: 104, guestName: 'David' },
    { id: 6, checkInDate: new Date('2024-03-15'), checkOutDate: new Date('2024-03-20'), revenue: 600, guestId: 105, guestName: 'Eve' },
    { id: 7, checkInDate: new Date('2024-04-01'), checkOutDate: new Date('2024-04-02'), revenue: 100, guestId: 106, guestName: 'Frank' },
    { id: 8, checkInDate: new Date('2024-04-05'), checkOutDate: new Date('2024-04-10'), revenue: 550, guestId: 107, guestName: 'Grace' },
    { id: 9, checkInDate: new Date('2024-04-12'), checkOutDate: new Date('2024-04-14'), revenue: 280, guestId: 108, guestName: 'Heidi' },
    { id: 10, checkInDate: new Date('2024-05-01'), checkOutDate: new Date('2024-05-05'), revenue: 400, guestId: 109, guestName: 'Ivan' },
    { id: 11, checkInDate: new Date('2024-05-10'), checkOutDate: new Date('2024-05-13'), revenue: 350, guestId: 110, guestName: 'Judy' },
    { id: 12, checkInDate: new Date('2024-05-18'), checkOutDate: new Date('2024-05-22'), revenue: 700, guestId: 111, guestName: 'Karl' },
  ];


  constructor(private fb: FormBuilder) { } // Inject FormBuilder

  ngOnInit(): void {
    // Initialize the date range form
    this.dateRangeForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });

    // Optionally generate a report for a default period on load
    // For example, current month:
    // this.setDefaultDateRange();
    // this.generateReport(); // Call it here if you set a default
  }

  // Optional: Set a default date range (e.g., current month)
  setDefaultDateRange(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month

    this.dateRangeForm.patchValue({
      startDate: startOfMonth,
      endDate: endOfMonth
    });
  }

  // Custom validator for date range (endDate must be after startDate)
  dateRangeValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const start = control.get('startDate')?.value;
    const end = control.get('endDate')?.value;

    if (start && end && start > end) {
      return { 'dateRangeInvalid': true };
    }
    return null;
  };


  generateReport(): void {
    // Manually run validators for cross-field validation
    this.dateRangeForm.setValidators(this.dateRangeValidator);
    this.dateRangeForm.updateValueAndValidity();


    if (this.dateRangeForm.valid) {
      const startDate: Date = this.dateRangeForm.get('startDate')?.value;
      const endDate: Date = this.dateRangeForm.get('endDate')?.value;

      let totalRevenue = 0;
      let checkIns = 0;
      let checkOuts = 0;
      const guestsVisited = new Set<number>(); // Use a Set to count unique guests

      this.mockBookingLogs.forEach(log => {
        // Normalize dates to start of day for accurate comparison
        const logCheckInDate = new Date(log.checkInDate.getFullYear(), log.checkInDate.getMonth(), log.checkInDate.getDate());
        const logCheckOutDate = new Date(log.checkOutDate.getFullYear(), log.checkOutDate.getMonth(), log.checkOutDate.getDate());
        const reportStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const reportEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        // Check if booking is within the report period
        // A booking is "relevant" if its check-in OR check-out date falls within the period
        // OR if the booking spans the entire period.
        const isBookingRelevant =
            (logCheckInDate >= reportStartDate && logCheckInDate <= reportEndDate) || // Check-in within range
            (logCheckOutDate >= reportStartDate && logCheckOutDate <= reportEndDate) || // Check-out within range
            (logCheckInDate < reportStartDate && logCheckOutDate > reportEndDate); // Booking spans the range

        if (isBookingRelevant) {
          totalRevenue += log.revenue;
          guestsVisited.add(log.guestId); // Add guest ID to the set

          // Count check-ins that fall exactly on a date within the range
          if (logCheckInDate >= reportStartDate && logCheckInDate <= reportEndDate) {
            checkIns++;
          }
          // Count check-outs that fall exactly on a date within the range
          if (logCheckOutDate >= reportStartDate && logCheckOutDate <= reportEndDate) {
            checkOuts++;
          }
        }
      });

      this.periodRevenue = totalRevenue;
      this.periodGuestsVisited = guestsVisited.size;
      this.periodCheckIns = checkIns;
      this.periodCheckOuts = checkOuts;

      console.log('Report generated for:', startDate, 'to', endDate);
      console.log('Revenue:', this.periodRevenue);
      console.log('Guests Visited:', this.periodGuestsVisited);
      console.log('Check-ins:', this.periodCheckIns);
      console.log('Check-outs:', this.periodCheckOuts);

    } else {
      this.dateRangeForm.markAllAsTouched(); // Show validation errors
      console.error('Invalid date range. Please select valid start and end dates.');
    }
  }
}