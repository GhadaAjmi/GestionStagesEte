import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaSoutenanceComponent } from './ma-soutenance.component';

describe('MaSoutenanceComponent', () => {
  let component: MaSoutenanceComponent;
  let fixture: ComponentFixture<MaSoutenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaSoutenanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaSoutenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
