import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListesoutenancesComponent } from './listesoutenances.component';

describe('ListesoutenancesComponent', () => {
  let component: ListesoutenancesComponent;
  let fixture: ComponentFixture<ListesoutenancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListesoutenancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListesoutenancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
