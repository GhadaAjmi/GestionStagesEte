import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditsoutenanceComponent } from './editsoutenance.component';

describe('EditsoutenanceComponent', () => {
  let component: EditsoutenanceComponent;
  let fixture: ComponentFixture<EditsoutenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditsoutenanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditsoutenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
