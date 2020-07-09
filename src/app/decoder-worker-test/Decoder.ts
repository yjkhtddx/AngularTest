/// <reference lib="webworker" />

import { WasmDedicatedWorkerGlobalScope, WasmModule } from './WasmModule';
import { DecoderWorkerTestMessageType as Type, DecoderWorkerTestMessage, DECODER_H265, LOG_LEVEL_FFMPEG, DecoderWorkerTestMessageType } from './Common';
import { NgModule } from '@angular/core';

export default class Decoder {
    private worker = self as unknown as WasmDedicatedWorkerGlobalScope;
    private wasm: WasmModule;
    // private decodeTimer?: number = undefined;
    private isWasmLoaded = false;
    constructor() {
        this.worker.name = 'DecoderWorker';
        this.wasm = this.wasm;
        this.wasm = typeof this.wasm !== 'undefined' ? this.wasm : {};
        this.wasm.onRuntimeInitialized = () => {
            this.postMessage({ type: DecoderWorkerTestMessageType.ON_WASM_LOADED });
            console.log('onRuntimeInitialized');
            const wasmModule: WasmModule = this.wasm as WasmModule;
            const decoderType = DECODER_H265;
            const LOG_LEVEL_WASM = LOG_LEVEL_FFMPEG;
            // const callback = wasmModule.addFunction(() => { });
            const callback = this.wasm.addFunction((
                addrY: number,
                addrU: number,
                addrV: number,
                strideY: number,
                strideU: number,
                strideV: number,
                width: number,
                height: number,
                pts: number
            ) => {
                console.log({
                    addrY,
                    addrU,
                    addrV,
                    strideY,
                    strideU,
                    strideV,
                    width,
                    height,
                    pts
                });
                // console.log('[%d]In video callback, size = %d * %d, pts = %d', ++this.videoSize, width, height, pts);
                const size = width * height + (width / 2) * (height / 2) + (width / 2) * (height / 2);
                const data = new Uint8Array(size);
                let pos = 0;
                for (let i = 0; i < height; i++) {
                    const src = addrY + i * strideY;
                    const tmp: ArrayBuffer = this.wasm.HEAPU8.subarray(src, src + width);
                    const u8Tmp = new Uint8Array(tmp);
                    data.set(u8Tmp, pos);
                    pos += u8Tmp.length;
                }
                console.log(pos);
                for (let i = 0; i < height / 2; i++) {
                    const src = addrU + i * strideU;
                    const tmp = this.wasm.HEAPU8.subarray(src, src + width / 2);
                    const u8Tmp = new Uint8Array(tmp);
                    data.set(u8Tmp, pos);
                    pos += u8Tmp.length;
                }
                console.log(pos);
                for (let i = 0; i < height / 2; i++) {
                    const src = addrV + i * strideV;
                    const tmp = this.wasm.HEAPU8.subarray(src, src + width / 2);
                    const u8Tmp = new Uint8Array(tmp);
                    data.set(u8Tmp, pos);
                    pos += u8Tmp.length;
                }
                console.log(pos);
                // const obj = {
                //     data,
                //     width,
                //     height
                // };
                // this.displayVideoFrame(obj);
            });
            wasmModule._openDecoder(decoderType, callback, LOG_LEVEL_WASM);
        };
        this.worker.importScripts('assets/wasm/libffmpeg_264_265.js');
        this.worker.addEventListener<'message'>('message', ({ data }) => {
            const message = data as DecoderWorkerTestMessage;
            this.onMessage(message);
        });
    }

    private postMessage(message: DecoderWorkerTestMessage) {
        if (message.data) {
            this.worker.postMessage(message, [message.data]);
        } else {
            this.worker.postMessage(message);
        }
    }

    public onMessage(req: DecoderWorkerTestMessage): void {
        if (!this.isWasmLoaded) {
            console.log('wait wasm loaded');
            return;
        }
    }
    public sendMessage(type: Type, data?: Uint8Array): void {
        this.worker.postMessage(data);
    }

}

