import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningIng1Component } from './planning-ing1.component';

describe('PlanningIng1Component', () => {
  let component: PlanningIng1Component;
  let fixture: ComponentFixture<PlanningIng1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanningIng1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanningIng1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
