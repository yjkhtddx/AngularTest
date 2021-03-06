import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkerTestComponent } from './worker-test/worker-test.component';
import { CanvasTestComponent } from './canvas-test/canvas-test.component';
import { WasmTestComponent } from './wasm-test/wasm-test.component';
import { DecoderTestComponent } from './decoder-test/decoder-test.component';
import { WebGLTestComponent } from './webgl-test/webgl-test.component';
import { WasmWorkerTestComponent } from './wasm-worker-test/wasm-worker-test.component';
import { DecoderWorkerTestComponent } from './decoder-worker-test/decoder-worker-test.component';

@NgModule({
  declarations: [
    AppComponent,
    WorkerTestComponent,
    CanvasTestComponent,
    WasmTestComponent,
    DecoderTestComponent,
    WebGLTestComponent,
    WasmWorkerTestComponent,
    DecoderWorkerTestComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
