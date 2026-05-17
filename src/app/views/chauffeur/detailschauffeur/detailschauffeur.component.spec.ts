import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailschauffeurComponent } from './detailschauffeur.component';

describe('DetailschauffeurComponent', () => {
  let component: DetailschauffeurComponent;
  let fixture: ComponentFixture<DetailschauffeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailschauffeurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailschauffeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
