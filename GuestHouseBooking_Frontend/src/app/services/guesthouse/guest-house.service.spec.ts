import { TestBed } from '@angular/core/testing';

import { GuestHouseService } from './guest-house.service';

describe('GuestHouseService', () => {
  let service: GuestHouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuestHouseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
