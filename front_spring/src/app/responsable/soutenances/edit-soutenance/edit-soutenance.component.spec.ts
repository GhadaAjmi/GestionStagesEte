import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSoutenanceComponent } from './edit-soutenance.component';

describe('EditSoutenanceComponent', () => {
  let component: EditSoutenanceComponent;
  let fixture: ComponentFixture<EditSoutenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSoutenanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSoutenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
