import { Component, Input } from '@angular/core';

@Component({
  selector: 'svg-close',
  template: `
    <div class="close">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="25"
          d="M368 368L144 144M368 144L144 368"
        />
      </svg>
    </div>
  `,
  styles: [
    `
      .close {
        height: 8vw;
        margin-top: 3vh;
        margin-left: 2.2vh;
        border-radius: 50%;
        background-color: #f4f4f4;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.42);
        z-index: 3;
        position: relative;
        display: flex;
      }
    `,
  ],
})
export class CloseSvg {
  @Input() imageModal: string = '';
}
