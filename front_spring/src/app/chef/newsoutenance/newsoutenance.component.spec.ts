import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsoutenanceComponent } from './newsoutenance.component';

describe('NewsoutenanceComponent', () => {
  let component: NewsoutenanceComponent;
  let fixture: ComponentFixture<NewsoutenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewsoutenanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsoutenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
