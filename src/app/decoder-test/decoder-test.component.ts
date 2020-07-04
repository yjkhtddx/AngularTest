import { Component, OnInit } from '@angular/core';
const CHUNK_SIZE = 4096;

@Component({
  selector: 'app-decoder-test',
  templateUrl: './decoder-test.component.html',
  styleUrls: ['./decoder-test.component.scss']
})
export class DecoderTestComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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
        console.log(size);

        console.count(`onload`);
        console.log(ev);
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
