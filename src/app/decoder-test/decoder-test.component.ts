import { Component, OnInit, OnDestroy } from '@angular/core';
import { Runner } from 'protractor';
const CHUNK_SIZE = 4096;
const DECODER_H264 = 0;
const DECODER_H265 = 1;
const LOG_LEVEL_JS = 0;
const LOG_LEVEL_WASM = 1;
const LOG_LEVEL_FFMPEG = 2;

@Component({
  selector: 'app-decoder-test',
  templateUrl: './decoder-test.component.html',
  styleUrls: ['./decoder-test.component.scss']
})
export class DecoderTestComponent implements OnInit, OnDestroy {
  private pts = 0;
  private videoSize = 0;
  private decoderType = DECODER_H265;
  private decoderLogLevel = LOG_LEVEL_WASM;
  private isWasmLoaded = false;
  private wasm = (window as any).Module as any;
  constructor() {
    this.wasm = typeof this.wasm !== 'undefined' ? this.wasm : {};
    this.wasm.onRuntimeInitialized = () => {
      console.log('onRuntimeInitialized');
      this.isWasmLoaded = true;
      this.onWasmLoaded();
    };
  }

  private onWasmLoaded(): void {
    const callback = this.wasm.addFunction((addr_y, addr_u, addr_v, stride_y, stride_u, stride_v, width, height, pts) => {
      console.log('[%d]In video callback, size = %d * %d, pts = %d', ++this.videoSize, width, height, pts);
    });
    this.wasm._openDecoder(this.decoderType, callback, this.decoderLogLevel);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.wasm._flushDecoder();
    this.wasm._closeDecoder();
  }

  play(files: Array<File>) {
    console.log(files);
    const file = files[0];
    let filePos = 0;
    let streamSize = 0;
    do {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        const typedArray: ArrayBuffer = ev.target.result as ArrayBuffer;
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
