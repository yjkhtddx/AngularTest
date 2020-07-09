
export interface WasmModule {
    onRuntimeInitialized?: () => void;
    addFunction?: (callback: any, type?: string) => number;
    _openDecoder?: (decoderType: number, callback: number, logLevel: number) => void;
    HEAPU8?: Uint8Array;
}

export interface WasmDedicatedWorkerGlobalScope extends DedicatedWorkerGlobalScope {
    name?: string;
    Module?: WasmModule;
}
