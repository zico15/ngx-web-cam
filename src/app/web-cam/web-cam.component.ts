import { Component, ElementRef, ViewChild , Input} from '@angular/core';
import jsQR from "jsqr";

@Component({
  selector: 'app-web-cam',
  templateUrl: './web-cam.component.html',
  styleUrls: ['./web-cam.component.scss'],
})
export class WebCamComponent {
  private static DEFAULT_VIDEO_OPTIONS: MediaTrackConstraints = {
    facingMode: 'environment',
  };

  @Input() width = 320;
  @Input() height = 500;
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  @Input() public captureImageData: boolean = false;
  /** The image type to use when capturing snapshots */
  @Input() public imageType: string = 'image/png';
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  @Input() public imageQuality: number = 1;

  @ViewChild('video', { static: true })
  private video!: ElementRef<HTMLVideoElement>;
  private stream: MediaStream | null = null;
  private canvas: HTMLCanvasElement = document.createElement('canvas');

  @ViewChild('img', { static: true })
  private img!: ElementRef<HTMLImageElement>;

  constructor() {
    console.log(
      'WebCamComponent constructor: ',
      WebCamComponent.DEFAULT_VIDEO_OPTIONS.deviceId
    );
  }

  ngOnInit() {
    console.log('WebCamComponent ngInit: ', this.width, this.height);
     
  }

  private setStream(stream: MediaStream) {
    this.stream = stream;
    this.video.nativeElement.srcObject = stream;
  }

  async player() {
    console.log(this.video);
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => this.setStream(stream))
        .catch(function (err0r) {
          console.log('Something went wrong!');
        });
    }
  }

  stop() {
    if (this.stream) {
      // pause video to prevent mobile browser freezes
      this.video.nativeElement.pause();
      // getTracks() returns all media tracks (video+audio)
      this.stream
        ?.getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    }
  }

  public download() {
    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = this.getSnapshot();
    link.click();
  }

  getSnapshot (width?: number, height?: number) {
    this.canvas.width = width ? width : this.width;
    this.canvas.height = height ? height : this.height;
    const ctx = this.canvas.getContext('2d');
    ctx?.drawImage(this.video.nativeElement, 0, 0, width ? width : this.width, height ? height : this.height);
    // read canvas content as image
    const dataUrl: string = this.canvas.toDataURL(this.imageType, this.imageQuality);
    this.img.nativeElement.src = dataUrl
    return dataUrl;
  }
}
