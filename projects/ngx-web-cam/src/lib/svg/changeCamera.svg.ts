import { Component, Input } from '@angular/core';

@Component({
  selector: 'svg-change-camera',
  template: `
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="ionicon"
        viewBox="0 0 512 512"
        style="color: #f4f4f4"
      >
        <path
          fill="#2a2a2a"
          d="M434.67 285.59v-29.8c0-98.73-80.24-178.79-179.2-178.79a179 179 0 00-140.14 67.36m-38.53 82v29.8C76.8 355 157 435 256 435a180.45 180.45 0 00140-66.92"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
        />
        <path
          fill="#2a2a2a"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
          d="M32 256l44-44 46 44M480 256l-44 44-46-44"
        />
      </svg>
    </div>
  `,
  styles: [],
})
export class ChangeCameraSvg {
  @Input() imageModal: string = '';
}