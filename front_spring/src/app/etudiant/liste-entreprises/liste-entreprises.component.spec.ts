import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEntreprisesComponent } from './liste-entreprises.component';

describe('ListeEntreprisesComponent', () => {
  let component: ListeEntreprisesComponent;
  let fixture: ComponentFixture<ListeEntreprisesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeEntreprisesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListeEntreprisesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
