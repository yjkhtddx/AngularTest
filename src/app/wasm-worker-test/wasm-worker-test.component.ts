import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-wasm-worker-test',
  templateUrl: './wasm-worker-test.component.html',
  styleUrls: ['./wasm-worker-test.component.scss']
})
export class WasmWorkerTestComponent implements OnInit, OnDestroy {
  private worker?: Worker = undefined;
  constructor() { }

  public runWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('./wasm-worker-test.worker', { type: 'module' });
      this.worker.onmessage = ({ data }) => {
        console.log(`WorkerOnMessage:${data}`);
      };
      this.worker.postMessage(`Hello`);
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  private stopWorker() {
    if (this.worker) {
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
