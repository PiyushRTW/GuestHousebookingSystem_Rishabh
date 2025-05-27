import { TestBed } from '@angular/core/testing';

import { BedServicesService } from './bed-services.service';

describe('BedServicesService', () => {
  let service: BedServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BedServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
