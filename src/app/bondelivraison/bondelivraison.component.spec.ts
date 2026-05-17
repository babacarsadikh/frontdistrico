import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BondelivraisonComponent } from './bondelivraison.component';

describe('BondelivraisonComponent', () => {
  let component: BondelivraisonComponent;
  let fixture: ComponentFixture<BondelivraisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BondelivraisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BondelivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
