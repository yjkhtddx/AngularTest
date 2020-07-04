import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkerTestComponent } from './worker-test/worker-test.component';
import { CanvasTestComponent } from './canvas-test/canvas-test.component';
import { WasmTestComponent } from './wasm-test/wasm-test.component';

@NgModule({
  declarations: [
    AppComponent,
    WorkerTestComponent,
    CanvasTestComponent,
    WasmTestComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
