import { Component, Input } from '@angular/core';

@Component({
  selector: 'svg-poubelle',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      style="color: #f4f4f4"
      class="poubelle"
      [ngClass]="imageModal ? 'show' : 'hide'"
    >
      <path
        d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="22"
      />
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-miterlimit="10"
        stroke-width="22"
        d="M80 112h352"
      />
      <path
        d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="22"
      />
    </svg>
  `,
  styles: [
    `
      .poubelle {
        display: flex;
        position: relative;
        padding: 0.5rem;
        width: 1.5rem;
        margin: 0.7rem;
        border-radius: 50%;
        background-color: #9f0000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.42);
        transition: opacity 0.3s ease-in-out;
        z-index: 3;
      }
      .poubelle:active {
        background-color: darken(#bf6262, 1%);
      }
      .poubelle.hide {
        opacity: 0;
        visibility: visible;
      }
      .poubelle.show {
        opacity: 1;
        visibility: visible;
      }
    `,
  ],
})
export class PoubelleSvg {
  @Input() imageModal:  any = undefined;
}
