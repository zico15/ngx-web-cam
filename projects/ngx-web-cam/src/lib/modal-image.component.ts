import { Component, Input } from '@angular/core';

@Component({
  selector: 'modal-image',
  templateUrl: './modal-image.component.html',
  styleUrls: ['./modal-image.component.scss'],
})
export class ModalImageComponent {
  @Input() imageModal: string = '';
}
