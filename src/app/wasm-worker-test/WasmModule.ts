
export interface WasmModule {
    onRuntimeInitialized?: () => void;
    addFunction?: (callback: any, type?: string) => number;
    _openDecoder?: (decoderType: number, callback: number, logLevel: number) => void;
}

export interface WasmDedicatedWorkerGlobalScope extends DedicatedWorkerGlobalScope {
    name?: string;
    Module?: WasmModule;
}
