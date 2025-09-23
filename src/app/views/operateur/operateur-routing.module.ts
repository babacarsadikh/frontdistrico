import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OperateurComponent } from './operateur.component';


const routes: Routes = [
  {
      path: '',
      component: OperateurComponent
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperateurRoutingModule { }

