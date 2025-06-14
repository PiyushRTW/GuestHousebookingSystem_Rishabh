export interface BookingLog {
  id: number;
  checkInDate: Date; 
  checkOutDate: Date;
  revenue: number;
  guestId: number; 
  guestName: string; 
}
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms'; 
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  reportForm: FormGroup;
  reportStats: any = {};
  loading = false;
  reportLoading = false;

  totalHotels: number = 5;
  totalRooms: number = 120;
  totalBookings: number = 75;
  pendingBookings: number = 10;
  dateRangeForm!: FormGroup;
  periodRevenue: number = 0;
  periodGuestsVisited: number = 0;
  periodCheckIns: number = 0;
  periodCheckOuts: number = 0;
  mockBookingLogs: BookingLog[] = [
    { id: 1, checkInDate: new Date('2024-01-05'), checkOutDate: new Date('2024-01-10'), revenue: 500, guestId: 101, guestName: 'Alice' },
    { id: 2, checkInDate: new Date('2024-01-12'), checkOutDate: new Date('2024-01-15'), revenue: 300, guestId: 102, guestName: 'Bob' },
    { id: 3, checkInDate: new Date('2024-02-01'), checkOutDate: new Date('2024-02-05'), revenue: 450, guestId: 101, guestName: 'Alice' }, 
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

  constructor(
    private dashboardService: DashboardService,
    private fb: FormBuilder
  ) {
    this.reportForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit() {
    this.loadOverallStats();
    this.dateRangeForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });

  }

  loadOverallStats() {
    this.loading = true;
    this.dashboardService.getOverallStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    });
  }

  setDefaultDateRange(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); 

    this.dateRangeForm.patchValue({
      startDate: startOfMonth,
      endDate: endOfMonth
    });
  }

  dateRangeValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const start = control.get('startDate')?.value;
    const end = control.get('endDate')?.value;

    if (start && end && start > end) {
      return { 'dateRangeInvalid': true };
    }
    return null;
  };

  generateReport() {
    if (this.reportForm.valid) {
      this.reportLoading = true;
      const { startDate, endDate } = this.reportForm.value;
      
      this.dashboardService.getPeriodReport(startDate, endDate).subscribe({
        next: (data) => {
          this.reportStats = data;
          this.reportLoading = false;
        },
        error: (error) => {
          console.error('Error generating report:', error);
          this.reportLoading = false;
        }
      });
    }
  }
}