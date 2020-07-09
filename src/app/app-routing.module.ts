import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkerTestComponent } from './worker-test/worker-test.component';
import { CanvasTestComponent } from './canvas-test/canvas-test.component';
import { WasmTestComponent } from './wasm-test/wasm-test.component';
import { DecoderTestComponent } from './decoder-test/decoder-test.component';
import { WebGLTestComponent } from './webgl-test/webgl-test.component';
import { WasmWorkerTestComponent } from './wasm-worker-test/wasm-worker-test.component';
import { DecoderWorkerTestComponent } from './decoder-worker-test/decoder-worker-test.component';



const routes: Routes = [
  { path: 'worker', component: WorkerTestComponent },
  { path: 'canvas', component: CanvasTestComponent },
  { path: 'wasm', component: WasmTestComponent },
  { path: 'decoder', component: DecoderTestComponent },
  { path: 'webgl', component: WebGLTestComponent },
  { path: 'wasm-worker', component: WasmWorkerTestComponent },
  { path: 'decoder-worker', component: DecoderWorkerTestComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
