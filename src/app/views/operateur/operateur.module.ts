import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { NgxPrintModule } from 'ngx-print';
import { OperateurRoutingModule } from './operateur-routing.module';
import { OperateurComponent } from './operateur.component';




@NgModule({
  imports: [
    CommonModule,
    OperateurRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    NgbModule,
    NgxPrintModule,


  ],
  declarations: [OperateurComponent],

})
export class OperateurModule { }
