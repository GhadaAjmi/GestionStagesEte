import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationdocsComponent } from './consultationdocs.component';

describe('ConsultationdocsComponent', () => {
  let component: ConsultationdocsComponent;
  let fixture: ComponentFixture<ConsultationdocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultationdocsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConsultationdocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
