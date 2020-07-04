import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wasm-test',
  templateUrl: './wasm-test.component.html',
  styleUrls: ['./wasm-test.component.scss']
})
export class WasmTestComponent implements OnInit {
  private wasm = (window as any).Module as any;
  constructor() {
    // console.log(`constructor ${typeof(this.wasm)}`);
    this.wasm = typeof this.wasm !== 'undefined' ? this.wasm : {};
    this.wasm.onRuntimeInitialized = () => {
      console.log('onRuntimeInitialized');
      const wasm = (window as any).Module as any;
      const decoderType = 0;
      const LOG_LEVEL_WASM = 1;
      const callback = wasm.addFunction(() => { });
      wasm._openDecoder(decoderType, callback, LOG_LEVEL_WASM);
    };
    // console.log(`constructor ${typeof(this.wasm)}`);
  }

  ngOnInit(): void {
  }
}
