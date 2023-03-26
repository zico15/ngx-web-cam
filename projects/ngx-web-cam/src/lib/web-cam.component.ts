import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import jsQR from "jsqr";

export type facingMode = "user" | "environment";

export const resolutions = {
  "640x480": { width: 640, height: 480 },
  "1280x720": { width: 1280, height: 720 },
  "1920x1080": { width: 1920, height: 1080 },
  "2560x1440": { width: 2560, height: 1440 },
  "3840x2160": { width: 3840, height: 2160 },
  "4096x2160": { width: 4096, height: 2160 }
};

export const frameRates = {
  "15": { ideal: 15, max: 30 },
  "30": { ideal: 30, max: 60 },
  "60": { ideal: 60, max: 60 }
};

@Component({
  selector: "web-cam",
  templateUrl: "./web-cam.component.html",
  styleUrls: ["./web-cam.component.scss"]
})
export class WebCamComponent {
  @Input() width = 320;
  @Input() height = 500;
  /** Flag to control whether an ImageData object is stored into the WebcamImage object. */
  @Input() captureImageData: boolean = false;
  /** The image type to use when capturing snapshots */
  @Input() imageType: string = "image/png";
  /** The image quality to use when capturing snapshots (number between 0 and 1) */
  @Input() imageQuality: number = 1;

  /** Flag to control active the audio or not.*/
  @Input() audio: boolean = false;
  /** Flag to control whether the webcam is active or not. */
  @Input() autoplay: boolean = false;

  /** type resolution
   * '640x480': { width: { ideal: 640}, height: { ideal: 480} },
   * '1280x720': { width: { ideal: 1280}, height: { ideal: 720 } },
   * '1920x1080': { width: { ideal: 1920}, height: { ideal: 1080 } },
   * '2560x1440': { width: { ideal: 2560}, height: { ideal: 1440 } },
   * '3840x2160': { width: { ideal: 3840}, height: { ideal: 2160 } },
   * '4096x2160': { width: { ideal: 4096}, height: { ideal: 2160 } },
   */
  @Input() resolution: { width: number; height: number } =
    resolutions["1280x720"];

  /** type facingMode
   * 'user' | 'environment'
   * */
  @Input() facingMode: facingMode = "environment";

  /** type frameRate
   * '15': { ideal: 15, max: 30 },
   * '30': { ideal: 30, max: 60 },
   * '60': { ideal: 60, max: 60 },
   * */
  @Input() frameRate: { ideal: number; max: number } = frameRates[60];

  @ViewChild("video", { static: true })
  private video!: ElementRef<HTMLVideoElement>;
  @ViewChild("canvas", { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;

  private videoTrack: MediaStreamTrack | null = null;
  private context!: CanvasRenderingContext2D | null;
  private stream: MediaStream | null = null;
  private imageData: ImageData | undefined = undefined;

  @Output() scanner = new EventEmitter<{
    codeType: string;
    codeData: string;
  }>();
  @Output() capture = new EventEmitter<Promise<string>>();

  constructor() {}

  ngOnInit() {
    this.canvas.nativeElement.width = this.resolution.width;
    this.canvas.nativeElement.height = this.resolution.height;
    this.context = this.canvas.nativeElement.getContext("2d", {
      willReadFrequently: true
    });
    if (this.scanner.observers.length > 0)
      this.video.nativeElement.addEventListener(
        "timeupdate",
        this.updateScanner.bind(this)
      );
    if (this.autoplay) this.player();

    setTimeout(() => {
      this.ontoggleVideo();
    }, 2000);
  }

  public ontoggleVideo() {
    if (this.isPlaying()) this.stop();
    else this.player();
  }

  public ontoggleFacingMode() {
    this.setFacingMode(this.facingMode === "user" ? "environment" : "user");
  }

  public setFacingMode(value: facingMode) {
    this.stop();
    this.facingMode = value;
    this.player();
  }

  public setResolution(value: { width: number; height: number }) {
    this.stop();
    this.resolution = value;
    this.player();
  }

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
        this.scanner.emit({ codeType: "qrcode", codeData: code.data });
    }
  }

  ngOnDestroy() {
    this.stop();
  }

  private setStream(stream: MediaStream) {
    this.stream = stream;
    this.videoTrack = stream.getVideoTracks()[0];
    this.canvas.nativeElement.width =
      this.videoTrack.getSettings().width || this.width;
    this.canvas.nativeElement.height =
      this.videoTrack.getSettings().height || this.height;
    this.video.nativeElement.srcObject = stream;
  }

  private initMedia() {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: this.facingMode,
            width: { ideal: this.resolution.width },
            height: { ideal: this.resolution.height },

            frameRate: this.frameRate,
            // Configurações do flash
            advanced: [
              {} // ativa o flash
            ]
          },
          audio: this.audio
        })
        .then((stream) => this.setStream(stream))
        .catch(function (err0r) {
          console.log("Something went wrong!\n", err0r);
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

  public getOrientation(): string {
    return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
  }

  public onCapture() {
    const snapshot = new Promise<string>((resolve, reject) => {
      const canvas = document.createElement("canvas");
      if (this.getOrientation().includes("landscape")) {
        canvas.width = this.videoTrack?.getSettings().height || this.height;
        canvas.height = this.videoTrack?.getSettings().width || this.width;
      } else {
        canvas.width = this.videoTrack?.getSettings().width || this.width;
        canvas.height = this.videoTrack?.getSettings().height || this.height;
      }
      // create canvas element
      const context = canvas.getContext("2d");
      context?.drawImage(
        this.video.nativeElement,
        0,
        0,
        canvas.width,
        canvas.height
      );
      // read canvas content as image
      const base64 = canvas.toDataURL(this.imageType);
      if (base64) resolve(base64);
      else reject("base64 is null");
    });
    this.capture.emit(snapshot);
  }
}
