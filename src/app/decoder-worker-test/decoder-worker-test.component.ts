import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { WebGLPlayer } from './webgl-player';
import { CHUNK_SIZE, DecoderWorkerTestMessage, DecoderWorkerTestMessageType } from './Common';

@Component({
  selector: 'app-decoder-worker-test',
  templateUrl: './decoder-worker-test.component.html',
  styleUrls: ['./decoder-worker-test.component.scss']
})
export class DecoderWorkerTestComponent implements OnInit, OnDestroy, AfterViewInit {
  private webglPlayer?: WebGLPlayer = undefined;
  private worker?: Worker = undefined;
  constructor() { }

  @ViewChild('playCanvas', { static: true }) playCanvas: ElementRef<HTMLCanvasElement>;
  ngAfterViewInit(): void {
    console.log(this.playCanvas);
    if (this.playCanvas) {
      this.webglPlayer = new WebGLPlayer(
        this.playCanvas.nativeElement, {}
      );
      console.log(this.webglPlayer);
    } else {
      console.error('canvas error');
    }
  }

  play(files: Array<File>) {
    console.log(files);
    const file = files[0];
    let filePos = 0;
    let streamSize = 0;

    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      const typedArray: Uint8Array = new Uint8Array(ev.target.result as ArrayBuffer);
      this.postMessage(this.worker, { type: DecoderWorkerTestMessageType.ON_DATA, data: typedArray });
    };
    const interval = window.setInterval(() => {
      streamSize = this.readFileSlice(reader, file, filePos, CHUNK_SIZE);
      filePos += streamSize;
      if (streamSize <= 0) {
        window.clearInterval(interval);
      }
    }, 200);

  }

  private readFileSlice(reader: FileReader, file: File, startAddr: number, size: number) {
    const fileSize = file.size;
    let fileSlice: Blob;

    if (startAddr > fileSize - 1) {
      return 0;
    }
    else if (startAddr + size > fileSize - 1) {
      // fileSlice = this.blobSlice(file, startAddr, fileSize);
      fileSlice = file.slice(startAddr, fileSize);
      reader.readAsArrayBuffer(fileSlice);
      return fileSize - startAddr;
    }
    else {
      fileSlice = file.slice(startAddr, startAddr + size);
      // fileSlice = this.blobSlice(file, startAddr, startAddr + size);
      reader.readAsArrayBuffer(fileSlice);
      return size;
    }
  }

  private handleMessage(message: DecoderWorkerTestMessage) {
    console.log(message);
    switch (message.type) {
      case DecoderWorkerTestMessageType.ON_DECODE_DATA:
        const width = message.rect.width;
        const height = message.rect.height;
        const yLength = width * height;
        const uvLength = (width / 2) * (height / 2);
        if (this.webglPlayer) {
          this.webglPlayer.renderSrcFrame(message.data, width, height, yLength, uvLength);
        } else {
          console.error('webgl init error');
        }
        break;

      default:
        break;
    }

  }

  public runWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('./decoder-worker-test.worker', { type: 'module' });
      this.worker.addEventListener<'message'>('message', ({ data }) => {
        const message = data as DecoderWorkerTestMessage;
        this.handleMessage(message);
      });
    }
  }

  private postMessage(worker: Worker, message: DecoderWorkerTestMessage) {
    if (worker) {
      if (message.data) {
        console.log(message);
        worker.postMessage(message, [message.data.buffer]);
      } else {
        worker.postMessage(message);
      }
    }
  }
  private stopWorker() {
    if (this.worker) {
      this.worker.removeEventListener<'message'>('message', ({ data }) => {
        console.log(data);
      });
      this.worker.terminate();
      this.worker = undefined;
    }
  }

  ngOnInit(): void {
    this.runWorker();
  }

  ngOnDestroy(): void {
    this.stopWorker();
  }

}
