import { NgModule } from '@angular/core';
import { WebCamComponent } from './web-cam.component';
import { FormsModule } from '@angular/forms';
import { ModalImageComponent } from './modal-image.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    WebCamComponent,
    ModalImageComponent
  ],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [
    WebCamComponent
  ]
})
export class WebCamModule { }
