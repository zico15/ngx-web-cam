import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import jsQR from "jsqr";

export type facingMode = 'user' | 'environment';

const resolutions = {
  '640x480': { width: { ideal: 640}, height: { ideal: 480} },
  '1280x720': { width: { ideal: 1280}, height: { ideal: 720 } },
  '1920x1080': { width: { ideal: 1920}, height: { ideal: 1080 } },
  '2560x1440': { width: { ideal: 2560}, height: { ideal: 1440 } },
  '3840x2160': { width: { ideal: 3840}, height: { ideal: 2160 } },
  '4096x2160': { width: { ideal: 4096}, height: { ideal: 2160 } },
}

export const frameRates = {
  '15': { ideal: 15, max: 30 },
  '30': { ideal: 30, max: 60 },
  '60': { ideal: 60, max: 60 },
}

@Component({
  selector: 'web-cam',
  templateUrl: './web-cam.component.html',
})
export class WebCamComponent {

  @Input() width = 320;
  @Input() height = 500;
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  @Input() captureImageData: boolean = false;
  /** The image type to use when capturing snapshots */
  @Input() imageType: string = 'image/png';
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  @Input() imageQuality: number = 1;

  /** Flag to control active the audio or not.*/
  @Input()  audio: boolean = false;
  /** Flag to control whether the webcam is active or not. */
  @Input()  autoplay : boolean = true;

  /** type resolution 
   * '640x480': { width: { ideal: 640}, height: { ideal: 480} },
   * '1280x720': { width: { ideal: 1280}, height: { ideal: 720 } },
   * '1920x1080': { width: { ideal: 1920}, height: { ideal: 1080 } },
   * '2560x1440': { width: { ideal: 2560}, height: { ideal: 1440 } },
   * '3840x2160': { width: { ideal: 3840}, height: { ideal: 2160 } },
   * '4096x2160': { width: { ideal: 4096}, height: { ideal: 2160 } },
   */
  @Input()  resolution: { width: { ideal: number}, height: { ideal: number} } = resolutions['1280x720'];

  /** type facingMode
   * 'user' | 'environment'
   * */
  @Input()  facingMode: facingMode = 'environment';

  /** type frameRate
   * '15': { ideal: 15, max: 30 },
   * '30': { ideal: 30, max: 60 },
   * '60': { ideal: 60, max: 60 },
   * */
  @Input()  frameRate: { ideal: number, max: number } = frameRates[30];

  @ViewChild('video', { static: true })
  private video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;

  private videoTrack: MediaStreamTrack | null = null;
  private context!: CanvasRenderingContext2D | null;
  private stream: MediaStream | null = null;
  private buffer_width: number;
  private buffer_height : number;
  private qrCode: string | undefined = undefined;

  /***
   * Scanner qr code and return the code
  @Output() scanner = new EventEmitter<string>();

  /***
   * Capture the image and return the base64 string
   */
  @Output() capture = new EventEmitter<Promise<string>>();


  QRCODE: string = 'QRCODE';
  selected: any = '640x480';


  constructor() {
    this.buffer_width = this.width;
    this.buffer_height = this.height;
  }



  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true });
    if (this.scanner.observed)
      this.video.nativeElement.addEventListener('timeupdate', this.updateScanner.bind(this));
    if (this.autoplay)
      this.player();
  }


  ontoggleVideo() {
    if (this.isPlaying())
      this.stop();
    else
      this.player();  
    }

  ontoggleFacingMode() {
      if (this.facingMode === 'user')
        this.setFacingMode('environment');
      else
        this.setFacingMode('user');
  }
    
  public  setFacingMode(value: facingMode) {
      this.stop();
      this.facingMode = value;
     
      this.player();
      console.log('setFacingMode: ', this.facingMode);
  }

  public setResolution(value: any) {
      this.stop();
      // this.resolution = resolutions[value] as any|| resolutions['1280x720'];
      this.player();
  }

  private async updateScanner() {
    new Promise((resolve, reject) => {

    this.context?.drawImage( this.video.nativeElement, 0, 0, resolutions['640x480'].width.ideal, resolutions['640x480'].height.ideal);
    const imageData = this.context?.getImageData(0, 0, resolutions['640x480'].width.ideal,  resolutions['640x480'].height.ideal);
    const uint8ClampedArray = imageData?.data;
    if (uint8ClampedArray)
    {
      const code = jsQR(uint8ClampedArray, resolutions['640x480'].width.ideal,  resolutions['640x480'].height.ideal);
      if (code && code.data.trim().length > 0 && (!this.qrCode || this.qrCode !== code.data))
      {
        this.qrCode = code.data;
        resolve(this.qrCode);
      }
      else
        reject();
    }
    }).then((code) => {
      this.scanner.emit(code as string);
    }).catch(() => {
    });
  }



  ngOnDestroy(){
    this.stop();
  }

  private setStream(stream: MediaStream) {
    this.stream = stream;
    this.videoTrack = stream.getVideoTracks()[0];
    this.buffer_width = this.videoTrack.getSettings().width || this.width;
    this.buffer_height = this.videoTrack.getSettings().height || this.height;
    this.canvas.nativeElement.width = this.buffer_width;
    this.canvas.nativeElement.height = this.buffer_height;
    const value:string = (this.buffer_width + 'x' + this.buffer_height).trim();
    console.log('value: (' + value + ')');
    this.video.nativeElement.srcObject = stream;
  }

  private async initMedia() {
    console.log(this.video);
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: this.facingMode,
            width: this.resolution.width, height: this.resolution.height, frameRate: this.frameRate
          },
          audio: this.audio,
        })
        .then((stream) => this.setStream(stream))
        .catch(function (err0r) {
          console.log('Something went wrong!\n', err0r);
        });
    }
  }

  /**
  * Starts the video stream from the webcam and starts scanning for QR codes.
     * @param deviceId The deviceId of the camera to use. If not provided, the default camera is used.
     * @param facingMode The facingMode of the camera to use. If not provided, the default camera is used.
     * @param resolution The resolution of the camera to use. If not provided, the default camera is used.
     * @param frameRate The frameRate of the camera to use. If not provided, the default camera is used.
     * @param audio The audio of the camera to use. If not provided, the default camera is used.
     */
  public player() {
    this.initMedia();
  }


  public stop() {
    this.video.nativeElement.pause();
    this.stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  }

  public isPlaying(): boolean {
    return !this.video.nativeElement.paused;
  }

  public onCapture () {
    const snapshot = new Promise<string>((resolve) => {
       // create canvas element
      const canvas = document.createElement('canvas');
      canvas.width =  this.buffer_width;
      canvas.height = this.buffer_height;
      const context = canvas.getContext('2d');
      context?.drawImage(this.video.nativeElement, 0, 0, this.buffer_width, this.buffer_height);
      // read canvas content as image
      resolve(canvas.toDataURL(this.imageType));
    });
    this.capture.emit(snapshot);
  }
}
