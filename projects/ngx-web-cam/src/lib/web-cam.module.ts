import { NgModule } from '@angular/core';
import { WebCamComponent } from './web-cam.component';
import { FormsModule } from '@angular/forms';
import { ModalImageComponent } from './modal-image.component';
import { CommonModule } from '@angular/common';
import { ChangeCameraSvg } from './svg/changeCamera.svg';
import { ChooseLibrarySvg } from './svg/chooseLibrary.svg';
import { CloseSvg } from './svg/close.svg';
import { PoubelleSvg } from './svg/poubelle.svg';
import { UploadSvg } from './svg/upload.svg';

@NgModule({
  declarations: [
    WebCamComponent,
    ModalImageComponent,
    ChangeCameraSvg,
    ChooseLibrarySvg,
    CloseSvg,
    PoubelleSvg,
    UploadSvg,
  ],
  imports: [FormsModule, CommonModule],
  exports: [WebCamComponent],
})
export class CameraModule {}
