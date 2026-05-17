import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LivraisonlistComponent } from './livraisonlist/livraisonlist.component';
import { LivraisondetailsComponent } from './livraisondetails/livraisondetails.component';


const routes: Routes = [
  {
      path: '',
      component: LivraisonlistComponent
  },
  {
      path: 'new',
      component: LivraisondetailsComponent
  },
  {
      path: 'edit/:id',
      component: LivraisondetailsComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LivraisonRoutingModule { }

