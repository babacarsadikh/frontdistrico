import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChauffeurRoutingModule } from './chauffeur-routing.module';
import { DetailschauffeurComponent } from './detailschauffeur/detailschauffeur.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { ListchauffeurComponent } from './listchauffeur/listchauffeur.component';
import { NgxPaginationModule } from 'ngx-pagination';




@NgModule({
  declarations: [
    ListchauffeurComponent,

  ],
  imports: [
    CommonModule,
    ChauffeurRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    FormsModule,
    NgxPaginationModule



  ],
})
export class ChauffeurModule { }
