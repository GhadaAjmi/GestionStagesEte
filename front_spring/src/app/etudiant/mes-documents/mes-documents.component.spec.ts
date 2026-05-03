import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesDocumentsComponent } from './mes-documents.component';

describe('MesDocumentsComponent', () => {
  let component: MesDocumentsComponent;
  let fixture: ComponentFixture<MesDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MesDocumentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
