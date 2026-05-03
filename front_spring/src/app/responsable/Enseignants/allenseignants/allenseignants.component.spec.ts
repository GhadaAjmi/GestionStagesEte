import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllenseignantsComponent } from './allenseignants.component';

describe('AllenseignantsComponent', () => {
  let component: AllenseignantsComponent;
  let fixture: ComponentFixture<AllenseignantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllenseignantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllenseignantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
