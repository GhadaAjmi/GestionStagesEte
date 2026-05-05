import { TestBed } from '@angular/core/testing';

import { UtilisateurImportService } from './utilisateur-import.service';

describe('UtilisateurImportService', () => {
  let service: UtilisateurImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilisateurImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
