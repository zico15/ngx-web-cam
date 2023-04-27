import { Component, Input } from '@angular/core';

@Component({
  selector: 'svg-choose-library',
  template: `
    <div >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="ionicon"
        viewBox="0 0 512 512"
        style="color: #f4f4f4"
      >
        <rect
          x="48"
          y="80"
          width="416"
          height="352"
          rx="48"
          ry="48"
          stroke="currentColor"
          stroke-linejoin="round"
          stroke-width="20"
          fill="#2a2a2a"
        />
        <circle
          cx="336"
          cy="176"
          r="32"
          stroke="currentColor"
          stroke-miterlimit="10"
          stroke-width="20"
          fill="#2a2a2a"
        />
        <path
          d="M304 335.79l-90.66-90.49a32 32 0 00-43.87-1.3L48 352M224 432l123.34-123.34a32 32 0 0143.11-2L464 368"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="20"
          fill="#2a2a2a"
        />
      </svg>
    </div>
  `,
  styles: [
   
  ],
})
export class ChooseLibrarySvg {
  @Input() imageModal: string = '';
}
