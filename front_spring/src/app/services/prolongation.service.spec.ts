import { TestBed } from '@angular/core/testing';

import { ProlongationService } from './prolongation.service';

describe('ProlongationService', () => {
  let service: ProlongationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProlongationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
