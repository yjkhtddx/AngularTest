
export interface WasmModule {
    onRuntimeInitialized?: () => void;
    addFunction?: (callback: any, type?: string) => number;
    _malloc?: (size: number) => number;
    _free?: (point: number) => void;
    _openDecoder?: (decoderType: number, callback: number, logLevel: number) => void;
    _decodeData?: (buffer: number, size: number, pts: number) => void;
    _flushDecoder?: () => void;
    _closeDecoder?: () => void;
    HEAPU8?: Uint8Array;
}

export interface WasmDedicatedWorkerGlobalScope extends DedicatedWorkerGlobalScope {
    name?: string;
    Module?: WasmModule;
}
