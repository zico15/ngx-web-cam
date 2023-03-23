import { NgModule } from '@angular/core';
import { WebCamComponent } from './web-cam.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    WebCamComponent
  ],
  imports: [
    FormsModule,
  ],
  exports: [
    WebCamComponent
  ]
})
export class WebCamModule { }
