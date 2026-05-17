import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListclientComponent } from './listclient/listclient.component';
import { DetailsclientComponent } from './detailsclient/detailsclient.component';
import { ClientRoutingModule } from './client-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { LivraisonRoutingModule } from '../livraison/livraison-routing.module';
import { NgxPrintModule } from 'ngx-print';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  imports: [
        CommonModule,
        ClientRoutingModule,
        NgbModule,
        LivraisonRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPrintModule,
        NgxPaginationModule
  ],
  declarations: [ListclientComponent,DetailsclientComponent]

})
export class ClientModule { }
