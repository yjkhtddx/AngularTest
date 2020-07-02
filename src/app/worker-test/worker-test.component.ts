import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-worker-test',
  templateUrl: './worker-test.component.html',
  styleUrls: ['./worker-test.component.scss']
})
export class WorkerTestComponent implements OnInit, OnDestroy {
  private worker?: Worker = undefined;
  constructor() { }

  public runWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('./worker-test.worker', { type: 'module' });
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
