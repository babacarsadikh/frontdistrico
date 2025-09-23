import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListchauffeurComponent } from './listchauffeur.component';

describe('ListchauffeurComponent', () => {
  let component: ListchauffeurComponent;
  let fixture: ComponentFixture<ListchauffeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListchauffeurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListchauffeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
