import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningIng2Component } from './planning-ing2.component';

describe('PlanningIng2Component', () => {
  let component: PlanningIng2Component;
  let fixture: ComponentFixture<PlanningIng2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanningIng2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanningIng2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
