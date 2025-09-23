import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionsRoutingModule } from './sessions-routing.module';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './signin/signin.component';
import { ForgotComponent } from './forgot/forgot.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    SessionsRoutingModule,

  ],
  declarations: [SignupComponent, LoginComponent, ForgotComponent]
})
export class SessionsModule { }
