import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSoutenanceComponent } from './new-soutenance.component';

describe('NewSoutenanceComponent', () => {
  let component: NewSoutenanceComponent;
  let fixture: ComponentFixture<NewSoutenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewSoutenanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewSoutenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
