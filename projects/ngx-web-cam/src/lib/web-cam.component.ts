import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import jsQR from 'jsqr';
import { AnimationService } from './animations/animation.service';

export type FacingMode = 'user' | 'environment';

export const resolutions = {
  '640x480': { width: 640, height: 480 },
  '1280x720': { width: 1280, height: 720 },
  '1920x1080': { width: 1920, height: 1080 },
  '2560x1440': { width: 2560, height: 1440 },
  '3840x2160': { width: 3840, height: 2160 },
  '4096x2160': { width: 4096, height: 2160 },
};

@Component({
  selector: 'web-cam',
  templateUrl: './web-cam.component.html',
  styleUrls: ['./web-cam.component.scss'],
})
export class WebCamComponent {
  @Input() mode: 'qrcode' | 'photo' = 'photo';
  @Input() maxImagesAllowed: number = 0;
  @Input() width = 320;
  @Input() height = 500;
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  @Input() captureImageData: boolean = false;
  /** The image type to use when capturing snapshots */
  @Input() imageType: string = 'image/png';
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  @Input() imageQuality: number = 100;

  /** Flag to control whether the webcam is active or not. */
  @Input() autoplay: boolean = true;

  /** type resolution
   * @example '640x480': { width: { ideal: 640}, height: { ideal: 480} },
   * @example '1280x720': { width: { ideal: 1280}, height: { ideal: 720 } },
   * @example '1920x1080': { width: { ideal: 1920}, height: { ideal: 1080 } },
   * @example '2560x1440': { width: { ideal: 2560}, height: { ideal: 1440 } },
   * @example '3840x2160': { width: { ideal: 3840}, height: { ideal: 2160 } },
   * @example '4096x2160': { width: { ideal: 4096}, height: { ideal: 2160 } },
   */
  @Input() resolution: { width: number; height: number } =
    resolutions['1280x720'];

  /** type facingMode (camera position)
   * @example 'user' | 'environment'
   * */
  @Input() facingMode: FacingMode = 'environment';

  /** type frameRate
   * @example '15': { ideal: 15 },
   * @example '30': { ideal: 30 },
   * @example '60': { ideal: 60 },
   * */
  @Input() frameRate: { ideal: number } = { ideal: 60 };

  @ViewChild('video', { static: true })
  private video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;

  private videoTrack: MediaStreamTrack | null = null;
  private context!: CanvasRenderingContext2D | null;
  private stream: MediaStream | null = null;
  private imageData: ImageData | undefined = undefined;
  private cameras: MediaDeviceInfo[] = [];
  private camera_index: number = 0;
  public isTorch: boolean = false;
  public hasTourchSupport: boolean = false;
  public isScanner: boolean = false;

  public images: string[] = [];

  public imageModal: string = '';

  animation: AnimationService;

  /**
	{codeType: string, codeData: string}
	 *
	 */
  @Output() scanner = new EventEmitter<{
    codeType: string;
    codeData: string;
  }>();
  @Output() onSubmit = new EventEmitter<string[]>();
  @Output() onClose = new EventEmitter<any>();

  constructor() {
    this.animation = inject(AnimationService);
  }

  /**
   * MediaDevices support check and init camera
   * */
  ngOnInit() {
    if ('mediaDevices' in navigator) {
      this.canvas.nativeElement.width = this.resolution.width;
      this.canvas.nativeElement.height = this.resolution.height;
      this.context = this.canvas.nativeElement.getContext('2d', {
        willReadFrequently: true,
      });
      this.isScanner = this.scanner.observed;
      if (this.isScanner) {
        this.resolution = resolutions['640x480'];
        this.video.nativeElement.addEventListener(
          'timeupdate',
          this.updateScanner.bind(this)
        );
      }
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.cameras = devices.filter(
            (device) => device.kind === 'videoinput'
          );
        })
        .finally(() => {
          this.camera_index = this.cameras.length - 1;
          if (this.autoplay) this.player();
        });
    }
  }

  public getVideo(): ElementRef<HTMLVideoElement> {
    return this.video;
  }

  public ontoggleVideo() {
    if (this.isPlaying()) this.stop();
    else this.player();
  }

  public close() {
    if (this.imageModal) {
      this.imageModal = '';
      this.animation.moveScrollingWrapperTop();
    } else if (
      !this.images.length ||
      confirm('Deseja realmente excluir este item?')
    )
      this.onClose.emit(null);
  }

  public action() {
    if (this.imageModal) {
      let res = confirm('Deseja realmente excluir este item?');
      if (res) this.images.splice(this.images.indexOf(this.imageModal), 1);
      if (!this.images.length) this.close();
    } else this.onSubmit.emit(this.images);
  }

  openModal(i: string) {
    this.animation.moveScrollingWrapperBottom();
    this.imageModal = i;
  }

  /**
   * Switches to front or rear camera  (user or environment)
   **/
  public ontoggleFacingMode() {
    this.setFacingMode(
      this.facingMode === 'user' || this.facingMode == null
        ? 'environment'
        : 'user'
    );
  }

  /**
   * FacingMode of video camera (user or environment)
   **/
  public setFacingMode(value: FacingMode) {
    this.stop();
    this.facingMode = value;
    this.player();
  }

  /**
   * Set resolution of video
   * */
  public setResolution(value: { width: number; height: number }) {
    this.stop();
    this.resolution = value;
    this.player();
  }

  /**
   * This method is called on each frame. It will try to find a QR code in the current frame.
   * */
  private async updateScanner() {
    this.context?.drawImage(
      this.video.nativeElement,
      0,
      0,
      this.resolution.width,
      this.resolution.height
    );
    this.imageData = this.context?.getImageData(
      0,
      0,
      this.resolution.width,
      this.resolution.height
    );
    const uint8ClampedArray = this.imageData?.data;
    if (uint8ClampedArray) {
      const code = jsQR(
        uint8ClampedArray,
        this.resolution.width,
        this.resolution.height
      );
      if (code && code.data.length > 0)
        this.scanner.emit({ codeType: 'qrcode', codeData: code.data });
    }
  }

  /**
   * OnToggleTorch is used to turn on or off the torch of the camera.
   * Android are supported.
   * */
  public onToggleTorch() {
    if (this.hasTourchSupport) {
      const track: any = this.stream?.getVideoTracks()[0];
      this.isTorch = !this.isTorch;
      track
        .applyConstraints({
          advanced: [{ torch: this.isTorch }],
        })
        .then(() => {});
    }
  }

  ngOnDestroy() {
    this.stop();
  }

  /**
   * Set the camera stream.
   * @param stream The stream to set.
   * */
  public setStream(stream: MediaStream) {
    this.stream = stream;
    this.videoTrack = stream.getVideoTracks()[0];
    const mode: string[] = this.videoTrack.getCapabilities().facingMode || [];
    if (mode && mode.length > 0) this.facingMode = mode[0] as FacingMode;
    else this.facingMode = 'user';
    if (this.facingMode === 'user')
      this.video.nativeElement.style.setProperty('transform', 'scaleX(-1)');
    else this.video.nativeElement.style.removeProperty('transform');
    this.canvas.nativeElement.width = this.resolution.width;
    this.canvas.nativeElement.height = this.resolution.height;
    this.video.nativeElement.srcObject = stream;
    // removeTrack when stream ended to avoid memory leak
    this.stream.addEventListener('ended', () => {
      if (this.videoTrack) this.stream?.removeTrack(this.videoTrack);
    });
    if (/Android/i.test(navigator.userAgent)) {
      try {
        this.video.nativeElement.play();
        const capabilitie: any = this.videoTrack.getCapabilities();
        this.hasTourchSupport = capabilitie?.torch;
      } catch (e) {
        this.hasTourchSupport = false;
      }
    }
  }

  /**
   * Select images from the device's gallery,
   * transform to base64 and add on images.
   * @param event
   * @returns
   **/
  async importFile(event: any) {
    if (event.target.files.length == 0)
      return alert('Nenhum arquivo selecionado!');
    let files: File[] = event.target.files;
    // Adds images to the list
    for (let file of files) {
      this.fileToBase64(file).then((base64) => {
        this.images.unshift(base64);
      });
    }
  }

  /**
   * @returns Base64 of the file passed by parameter.
   **/
  private fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString() || '');
      reader.onerror = (error) => reject(error);
    });
  }
  /**
   * Starts the video stream from the webcam and starts scanning for QR codes.
   * @param camera The camera to use. If not provided, the default camera is used.
   **/
  private initMedia(camera: MediaDeviceInfo) {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: camera.deviceId,
          facingMode: this.facingMode,
          height: { ideal: this.resolution.height },
          width: { ideal: this.resolution.width },
        },
      })
      .then((stream) => this.setStream(stream));
  }

  /**
   * Plays the video stream from the webcam and starts scanning for QR codes.
   */
  public player() {
    if (this.cameras.length > 0) {
      this.initMedia(this.cameras[this.camera_index]);
    }
  }

  /**
   * Stops the video stream from the webcam
   * */
  public stop() {
    this.video.nativeElement.pause();
    this.stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  }

  /**
   * Returns true if the video stream is playing.
   * */
  public isPlaying(): boolean {
    return !this.video.nativeElement.paused;
  }

  /**
   * Returns the current orientation of the device.
   * */
  public getOrientation(): string {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  /**
   *  Captures the current frame from the video stream and returns a promise that resolves with the image as a base64 encoded string.
   *  @param type The type of the image to return. Defaults to 'image/png'.
   *  @param quality The quality of the image to return. Defaults to 0.92.
   *  @returns base64: string
   * **/
  public onCapture(): string {
    this.animation.createAnimation();
    const canvas = document.createElement('canvas');
    // create canvas element
    const context = canvas.getContext('2d');
    if (context != null && this.videoTrack != null) {
      canvas.width = this.videoTrack.getSettings().width || this.width;
      canvas.height = this.videoTrack.getSettings().height || this.height;
      if (this.facingMode == 'user' || this.facingMode == null) {
        // draw video element into canvas
        context.save();
        context.scale(-1, 1); // mirrors the context
        context.drawImage(
          this.video.nativeElement,
          -canvas.width,
          0,
          canvas.width,
          canvas.height
        ); // draws the mirror video
        context.restore();
      } else
        context.drawImage(
          this.video.nativeElement,
          0,
          0,
          canvas.width,
          canvas.height
        );
    }
    // read canvas content as image
    const base64: string = canvas.toDataURL(this.imageType, this.imageQuality);
    this.images.unshift(base64); // Add image to the list
    return base64;
  }

  get isQr(): boolean {
    return this.mode == 'qrcode';
  }
  get isPhoto(): boolean {
    return this.mode == 'photo';
  }
  get hasMaxImages() {
    let len = this.images.length;
    return len >= this.maxImagesAllowed && this.maxImagesAllowed > 0;
  }
}
