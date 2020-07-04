import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkerTestComponent } from './worker-test/worker-test.component';
import { CanvasTestComponent } from './canvas-test/canvas-test.component';
import { WasmTestComponent } from './wasm-test/wasm-test.component';

const routes: Routes = [
  { path: 'worker', component: WorkerTestComponent },
  { path: 'canvas', component: CanvasTestComponent },
  { path: 'wasm', component: WasmTestComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
