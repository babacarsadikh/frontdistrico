import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ListclientComponent } from './listclient/listclient.component';
import { DetailsclientComponent } from './detailsclient/detailsclient.component';


const routes: Routes = [
    {
        path: '',
        component: ListclientComponent
    },
    {
        path: 'new',
        component: ListclientComponent
    },
    {
        path: 'edit/:id',
        component: DetailsclientComponent
    }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],

   exports: [RouterModule]

})
export class ClientRoutingModule { }
