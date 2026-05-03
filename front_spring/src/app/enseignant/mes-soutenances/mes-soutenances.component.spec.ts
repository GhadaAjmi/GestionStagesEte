import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesSoutenancesComponent } from './mes-soutenances.component';

describe('MesSoutenancesComponent', () => {
  let component: MesSoutenancesComponent;
  let fixture: ComponentFixture<MesSoutenancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MesSoutenancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesSoutenancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
