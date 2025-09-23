import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ListchauffeurComponent } from './listchauffeur/listchauffeur.component';

const routes: Routes = [
    {
        path: '',
        component: ListchauffeurComponent
    },
    {
        path: 'new',
        component: ListchauffeurComponent
    },
    {
        path: 'edit/:id',
        component: ListchauffeurComponent
    }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],

   exports: [RouterModule]

})
export class ChauffeurRoutingModule { }
