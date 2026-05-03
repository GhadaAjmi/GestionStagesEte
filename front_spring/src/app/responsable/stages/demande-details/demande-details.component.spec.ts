import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeDetailsComponent } from './demande-details.component';

describe('DemandeDetailsComponent', () => {
  let component: DemandeDetailsComponent;
  let fixture: ComponentFixture<DemandeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DemandeDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
