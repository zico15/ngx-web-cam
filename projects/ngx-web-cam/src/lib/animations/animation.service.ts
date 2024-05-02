import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  async createAnimation() {
    let takePicButton = document.querySelector(
      '.footer-button-takePicture'
    ) as HTMLElement;
    takePicButton.style.width = '7vh';
    takePicButton.style.height = '7vh';
    await this.wait(120);
    takePicButton.style.width = '7.4vh';
    takePicButton.style.height = '7.4vh';
  }

  async moveScrollingWrapperBottom() {
    try {
      if (!window.matchMedia('(orientation: landscape)').matches) {
        // Screen is in landscape orientation
        const scrollingWrapper = document.querySelector(
          '.scrolling-wrapper'
        ) as HTMLElement;
        const footer = document.querySelector('.footer') as HTMLElement;
        scrollingWrapper.classList.add('move-scrollWrapper-bottom');
        scrollingWrapper.classList.remove('move-scrollWrapper-top');
        footer.style.filter = 'blur(0px)';
        footer.classList.add('gradual-blur');
        footer.classList.remove('rm-gradual-blur');
      }
    } catch (error) {}
  }
  async moveScrollingWrapperTop() {
    try {
      if (!window.matchMedia('(orientation: landscape)').matches) {
        const scrollingWrapper = document.querySelector(
          '.scrolling-wrapper'
        ) as HTMLElement;
        scrollingWrapper.classList.add('move-scrollWrapper-top');
        const footer = document.querySelector('.footer') as HTMLElement;
        footer.classList.add('rm-gradual-blur');
        footer.classList.remove('gradual-blur');
      }
    } catch (error) {}
  }

  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
