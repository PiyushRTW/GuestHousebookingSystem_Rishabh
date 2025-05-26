import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBookingComponent } from './admin-booking.component';

describe('AdminBookingComponent', () => {
  let component: AdminBookingComponent;
  let fixture: ComponentFixture<AdminBookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminBookingComponent]
    });
    fixture = TestBed.createComponent(AdminBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
