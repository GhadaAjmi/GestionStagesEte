import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesstageComponent } from './demandesstage.component';

describe('DemandesstageComponent', () => {
  let component: DemandesstageComponent;
  let fixture: ComponentFixture<DemandesstageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DemandesstageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandesstageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
