import { TestBed } from '@angular/core/testing';

import { DetailsDemandeService } from './details-demande.service';

describe('DetailsDemandeService', () => {
  let service: DetailsDemandeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailsDemandeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
