import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { WebGLPlayer } from './webgl-player';
const CHUNK_SIZE = 4096;
const DECODER_H264 = 0;
const DECODER_H265 = 1;
const LOG_LEVEL_JS = 0;
const LOG_LEVEL_WASM = 1;
const LOG_LEVEL_FFMPEG = 2;

@Component({
  selector: 'app-web-gltest',
  templateUrl: './webgl-test.component.html',
  styleUrls: ['./webgl-test.component.scss']
})
export class WebGLTestComponent implements OnInit, OnDestroy, AfterViewInit {
  private webglPlayer?: WebGLPlayer;
  private pts = 0;
  private videoSize = 0;
  private decoderType = DECODER_H265;
  private decoderLogLevel = LOG_LEVEL_WASM;
  private isWasmLoaded = false;
  private wasm = (window as any).Module as any;

  @ViewChild('playCanvas', { static: true }) playCanvas: ElementRef<HTMLCanvasElement>;
  constructor() {
    this.wasm = typeof this.wasm !== 'undefined' ? this.wasm : {};
    this.wasm.onRuntimeInitialized = () => {
      console.log('onRuntimeInitialized');
      this.isWasmLoaded = true;
      this.onWasmLoaded();
    };

  }

  ngAfterViewInit(): void {
    console.log(this.playCanvas);
    if (this.playCanvas) {
      this.webglPlayer = new WebGLPlayer(
        this.playCanvas.nativeElement, {}
      );
      console.log(this.webglPlayer);
    }else{
      console.error('canvas error');
    }
  }
  private onWasmLoaded(): void {
    const callback = this.wasm.addFunction((
      addrY: number,
      addrU: number,
      addrV: number,
      strideY: number,
      strideU: number,
      strideV: number,
      width: number,
      height: number,
      pts: number
    ) => {
      console.log({addrY,
        addrU,
        addrV,
        strideY,
        strideU,
        strideV,
        width,
        height,
        pts});
      // console.log('[%d]In video callback, size = %d * %d, pts = %d', ++this.videoSize, width, height, pts);
      const size = width * height + (width / 2) * (height / 2) + (width / 2) * (height / 2);
      const data = new Uint8Array(size);
      let pos = 0;
      for (let i = 0; i < height; i++) {
        const src = addrY + i * strideY;
        const tmp: ArrayBuffer = this.wasm.HEAPU8.subarray(src, src + width);
        const u8Tmp = new Uint8Array(tmp);
        data.set(u8Tmp, pos);
        pos += u8Tmp.length;
      }
      console.log(pos);
      for (let i = 0; i < height / 2; i++) {
        const src = addrU + i * strideU;
        const tmp = this.wasm.HEAPU8.subarray(src, src + width / 2);
        const u8Tmp = new Uint8Array(tmp);
        data.set(u8Tmp, pos);
        pos += u8Tmp.length;
      }
      console.log(pos);
      for (let i = 0; i < height / 2; i++) {
        const src = addrV + i * strideV;
        const tmp = this.wasm.HEAPU8.subarray(src, src + width / 2);
        const u8Tmp = new Uint8Array(tmp);
        data.set(u8Tmp, pos);
        pos += u8Tmp.length;
      }
      console.log(pos);
      const obj = {
        data,
        width,
        height
      };
      this.displayVideoFrame(obj);
    });
    this.wasm._openDecoder(this.decoderType, callback, this.decoderLogLevel);
  }

  ngOnInit(): void {
    console.log(this.playCanvas);
  }

  ngOnDestroy(): void {
    this.wasm._flushDecoder();
    this.wasm._closeDecoder();
  }

  private displayVideoFrame(obj: { data: Uint8Array, width: number, height: number }): void {
    const data = new Uint8Array(obj.data);
    const width = obj.width;
    const height = obj.height;
    const yLength = width * height;
    const uvLength = (width / 2) * (height / 2);
    if (this.webglPlayer) {
      this.webglPlayer.renderSrcFrame(data, width, height, yLength, uvLength);
    } else {
      console.error('webgl init error');
    }
  }

  play(files: Array<File>) {
    console.log(files);
    const file = files[0];
    let filePos = 0;
    let streamSize = 0;
    do {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const typedArray: Uint8Array = new Uint8Array(ev.target.result as ArrayBuffer);
        const size = typedArray.byteLength;

        let cacheBuffer = this.wasm._malloc(size);
        this.wasm.HEAPU8.set(typedArray, cacheBuffer);
        this.wasm._decodeData(cacheBuffer, size, this.pts++);
        if (cacheBuffer != null) {
          this.wasm._free(cacheBuffer);
          cacheBuffer = null;
        }
        if (size < CHUNK_SIZE) {
          console.log('Flush frame data');
          this.wasm._flushDecoder();
          this.wasm._closeDecoder();
        }
      };
      streamSize = this.readFileSlice(reader, file, filePos, CHUNK_SIZE);
      filePos += streamSize;
    } while (streamSize > 0);
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

  // private blobSlice(blob: File, startAddr: number, endAddr: number): Blob {
  //   if (blob.slice) {
  //     return blob.slice(startAddr, endAddr);
  //   }
  //   // compatible firefox
  //   if (blob.mozSlice) {
  //     return blob.mozSlice(startAddr, endAddr);
  //   }
  //   // compatible webkit
  //   if (blob.webkitSlice) {
  //     return blob.webkitSlice(startAddr, endAddr);
  //   }
  //   return null;
  // }

}
