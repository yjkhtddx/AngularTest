import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkerTestComponent } from './worker-test/worker-test.component';
import { CanvasTestComponent } from './canvas-test/canvas-test.component';
import { WasmTestComponent } from './wasm-test/wasm-test.component';
import { DecoderTestComponent } from './decoder-test/decoder-test.component';
import { WebGLTestComponent } from './web-gltest/web-gltest.component';

const routes: Routes = [
  { path: 'worker', component: WorkerTestComponent },
  { path: 'canvas', component: CanvasTestComponent },
  { path: 'wasm', component: WasmTestComponent },
  { path: 'decoder', component: DecoderTestComponent },
  { path: 'webgl', component: WebGLTestComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
