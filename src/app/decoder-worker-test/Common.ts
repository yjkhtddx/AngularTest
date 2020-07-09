export const CHUNK_SIZE = 4096;
export const DECODER_H264 = 0;
export const DECODER_H265 = 1;
export const LOG_LEVEL_JS = 0;
export const LOG_LEVEL_WASM = 1;
export const LOG_LEVEL_FFMPEG = 2;

export enum DecoderWorkerTestMessageType {
    ON_INIT, // 组件初始化
    ON_DATA, // H265数据
    ON_DESTROY, // 组件注销
    ON_WASM_LOADED, // wasm加载完成
    ON_DECODE_DATA // 解码数据
}

export interface DecoderWorkerTestMessage {
    type: DecoderWorkerTestMessageType;
    rect?: { width: number, height: number };
    data?: Uint8Array;
}
