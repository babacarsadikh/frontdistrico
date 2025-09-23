import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivraisondetailsComponent } from './livraisondetails.component';

describe('LivraisondetailsComponent', () => {
  let component: LivraisondetailsComponent;
  let fixture: ComponentFixture<LivraisondetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivraisondetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivraisondetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
