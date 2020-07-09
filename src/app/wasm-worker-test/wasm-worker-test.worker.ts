/// <reference lib="webworker" />

import { WasmDedicatedWorkerGlobalScope, WasmModule } from './WasmModule';

function initWorker() {
  // const WorkerSelf = self as any;
  const WorkerSelf = self as unknown as WasmDedicatedWorkerGlobalScope;
  WorkerSelf.name = 'DecoderWorker';
  WorkerSelf.Module = typeof WorkerSelf.Module !== 'undefined' ? WorkerSelf.Module : {};
  WorkerSelf.Module.onRuntimeInitialized = () => {
    console.log('onRuntimeInitialized');
    const wasmModule: WasmModule = WorkerSelf.Module as WasmModule;
    const decoderType = 0;
    const LOG_LEVEL_WASM = 1;
    const callback = wasmModule.addFunction(() => { });
    wasmModule._openDecoder(decoderType, callback, LOG_LEVEL_WASM);
  };
  WorkerSelf.importScripts('assets/wasm/libffmpeg_264_265.js');
}
initWorker();

addEventListener('message', ({ data }) => {
  const response = `worker response to ${data}`;
  postMessage(response);
});
