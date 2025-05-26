import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditHotelDialogComponent } from './add-edit-hotel-dialog.component';

describe('AddEditHotelDialogComponent', () => {
  let component: AddEditHotelDialogComponent;
  let fixture: ComponentFixture<AddEditHotelDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditHotelDialogComponent]
    });
    fixture = TestBed.createComponent(AddEditHotelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
