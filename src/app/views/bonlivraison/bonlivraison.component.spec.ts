import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonlivraisonComponent } from './bonlivraison.component';

describe('BonlivraisonComponent', () => {
  let component: BonlivraisonComponent;
  let fixture: ComponentFixture<BonlivraisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonlivraisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonlivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
