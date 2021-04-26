import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KyoobeeComponent } from './components/kyoobee/kyoobee.component';



@NgModule({
  declarations: [
    KyoobeeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    KyoobeeComponent
  ]
})
export class KyoobeeModule { }
