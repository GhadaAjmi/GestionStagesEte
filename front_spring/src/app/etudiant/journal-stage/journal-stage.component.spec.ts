import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalStageComponent } from './journal-stage.component';

describe('JournalStageComponent', () => {
  let component: JournalStageComponent;
  let fixture: ComponentFixture<JournalStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JournalStageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JournalStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
