/// <reference lib="webworker" />

import { WasmDedicatedWorkerGlobalScope, WasmModule } from './WasmModule';
import { DecoderWorkerTestMessageType as Type, DecoderWorkerTestMessage, DECODER_H265, LOG_LEVEL_FFMPEG, DecoderWorkerTestMessageType, CHUNK_SIZE } from './Common';

export default class Decoder {
    private className = 'Decoder';
    private worker = self as unknown as WasmDedicatedWorkerGlobalScope;
    private wasm: WasmModule;
    private pts = 0;
    // private decodeTimer?: number = undefined;
    private isWasmLoaded = false;
    constructor() {
        this.postMessage({ type: DecoderWorkerTestMessageType.ON_INIT });
        console.log(`constructor ${this.className}`);
        this.worker.name = 'DecoderWorker';
        this.worker.Module = typeof this.worker.Module !== 'undefined' ? this.worker.Module : {};
        this.wasm = this.worker.Module;
        this.wasm.onRuntimeInitialized = () => {
            console.log('onRuntimeInitialized');
            this.postMessage({ type: DecoderWorkerTestMessageType.ON_WASM_LOADED });
            this.isWasmLoaded = true;
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
                // console.log(pos);
                for (let i = 0; i < height / 2; i++) {
                    const src = addrU + i * strideU;
                    const tmp = this.wasm.HEAPU8.subarray(src, src + width / 2);
                    const u8Tmp = new Uint8Array(tmp);
                    data.set(u8Tmp, pos);
                    pos += u8Tmp.length;
                }
                // console.log(pos);
                for (let i = 0; i < height / 2; i++) {
                    const src = addrV + i * strideV;
                    const tmp = this.wasm.HEAPU8.subarray(src, src + width / 2);
                    const u8Tmp = new Uint8Array(tmp);
                    data.set(u8Tmp, pos);
                    pos += u8Tmp.length;
                }
                // console.log(pos);
                // const obj = {Failed to execute 'postMessage' on 'Worker':
                //     data,
                //     width,
                //     height
                // };
                // this.displayVideoFrame(obj);
                this.postMessage({ type: DecoderWorkerTestMessageType.ON_DECODE_DATA, rect: { width, height }, data });
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
            this.worker.postMessage(message, [message.data.buffer]);
        } else {
            this.worker.postMessage(message);
        }
    }

    private wasmFeedData(data: Uint8Array) {
        const size = data.byteLength;
        let cacheBuffer = this.wasm._malloc(size);
        this.wasm.HEAPU8.set(data, cacheBuffer);
        this.wasm._decodeData(cacheBuffer, size, this.pts++);
        if (cacheBuffer != null) {
            this.wasm._free(cacheBuffer);
            cacheBuffer = null;
        }
        if (size < CHUNK_SIZE) {
            console.log('Flush frame data');
            this.wasm._flushDecoder();
            this.wasm._closeDecoder();
        }
    }

    private onMessage(message: DecoderWorkerTestMessage): void {
        if (!this.isWasmLoaded) {
            console.log('wait wasm loaded');
            return;
        }
        switch (message.type) {
            case DecoderWorkerTestMessageType.ON_DATA:
                this.wasmFeedData(message.data);
                break;

            default:
                break;
        }
    }
}

