import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUtilisateurComponent } from './import-utilisateur.component';

describe('ImportUtilisateurComponent', () => {
  let component: ImportUtilisateurComponent;
  let fixture: ComponentFixture<ImportUtilisateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportUtilisateurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
