import { WebGLTexture } from './webgl-texture';

interface WebGLPlayerOptions {
    pixFmt?: number;
    videoWidth?: number;
    videoHeight?: number;
    yLength?: number;
    uvLength?: number;
}

export class WebGLPlayer {
    private gl: WebGLRenderingContext;
    private webglY: WebGLTexture;
    private webglU: WebGLTexture;
    private webglV: WebGLTexture;
    constructor(private canvas: HTMLCanvasElement, private options: WebGLPlayerOptions) {
        this.canvas = canvas;
        // this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        this.gl = canvas.getContext('webgl');
        this.initGL();
    }

    private initGL(): void {
        if (!this.gl) {
            console.log('[ER] WebGL not supported.');
            return;
        }

        const gl: WebGLRenderingContext = this.gl;
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        const program = gl.createProgram();
        const vertexShaderSource = [
            'attribute highp vec4 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'varying highp vec2 vTextureCoord;',
            'void main(void) {',
            ' gl_Position = aVertexPosition;',
            ' vTextureCoord = aTextureCoord;',
            '}'
        ].join('\n');
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        const fragmentShaderSource = [
            'precision highp float;',
            'varying lowp vec2 vTextureCoord;',
            'uniform sampler2D YTexture;',
            'uniform sampler2D UTexture;',
            'uniform sampler2D VTexture;',
            'const mat4 YUV2RGB = mat4',
            '(',
            ' 1.1643828125, 0, 1.59602734375, -.87078515625,',
            ' 1.1643828125, -.39176171875, -.81296875, .52959375,',
            ' 1.1643828125, 2.017234375, 0, -1.081390625,',
            ' 0, 0, 0, 1',
            ');',
            'void main(void) {',
            ' gl_FragColor = vec4( texture2D(YTexture, vTextureCoord).x, texture2D(UTexture, vTextureCoord).x, texture2D(VTexture, vTextureCoord).x, 1) * YUV2RGB;',
            '}'
        ].join('\n');

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('[ER] Shader link failed.');
        }
        const vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition');
        gl.enableVertexAttribArray(vertexPositionAttribute);
        const textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord');
        gl.enableVertexAttribArray(textureCoordAttribute);

        const verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        // const tempGL = this.gl as any;
        // tempGL.y = new WebGLTexture(gl);
        // tempGL.u = new WebGLTexture(gl);
        // tempGL.v = new WebGLTexture(gl);
        // tempGL.y.bind(0, program, 'YTexture');
        // tempGL.u.bind(1, program, 'UTexture');
        // tempGL.v.bind(2, program, 'VTexture');

        this.webglY = new WebGLTexture(gl);
        this.webglU = new WebGLTexture(gl);
        this.webglV = new WebGLTexture(gl);
        this.webglY.bind(0, program, 'YTexture');
        this.webglY.bind(1, program, 'UTexture');
        this.webglY.bind(2, program, 'VTexture');
    }
    /**
     * 全画布渲染YUV数据
     * @param videoFrame YUV420P数据 Uint8Array
     * @param width 宽度
     * @param height 高度
     * @param uOffset u数据偏移量
     * @param vOffset v数据偏移量
     */
    public renderFrame(videoFrame: Uint8Array, width: number, height: number, uOffset: number, vOffset: number) {
        if (!this.gl) {
            console.log('[ER] Render frame failed due to WebGL not supported.');
            return;
        }
        const gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.webglY.fill(width, height, videoFrame.subarray(0, uOffset));
        // tslint:disable-next-line: no-bitwise
        this.webglU.fill(width >> 1, height >> 1, videoFrame.subarray(uOffset, uOffset + vOffset));
        // tslint:disable-next-line: no-bitwise
        this.webglV.fill(width >> 1, height >> 1, videoFrame.subarray(uOffset + vOffset, videoFrame.length));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * 等比例渲染YUV数据
     * @param videoFrame YUV420P数据 Uint8Array
     * @param width 宽度
     * @param height 高度
     * @param uOffset u数据偏移量
     * @param vOffset v数据偏移量
     */
    public renderSrcFrame(videoFrame: Uint8Array, width: number, height: number, uOffset: number, vOffset: number) {
        if (!this.gl) {
            console.log('[ER] Render frame failed due to WebGL not supported.');
            return;
        }

        const gl = this.gl;

        // console.log(gl.canvas.width);
        // console.log(gl.canvas.height);
        // 刷纯黑背景（RBB自己改颜色也可）
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // 刷透明背景
        // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // gl.clearColor(0.0, 0.0, 0.0, 0.0);
        // gl.clear(gl.COLOR_BUFFER_BIT);


        let tempX = 0;
        let tempY = 0;
        let tempWidth = gl.canvas.width;
        let tempHeight = gl.canvas.height;

        if (width * 0.1 / height >= gl.canvas.width * 0.1 / gl.canvas.height) {
            tempHeight = gl.canvas.width * height / width;
            tempY = (gl.canvas.height - tempHeight) / 2;
        } else {
            tempWidth = gl.canvas.height * width / height;
            tempX = (gl.canvas.width - tempWidth) / 2;
        }
        gl.viewport(tempX, tempY, tempWidth, tempHeight);

        this.webglY.fill(width, height, videoFrame.subarray(0, uOffset));
        // tslint:disable-next-line: no-bitwise
        this.webglU.fill(width >> 1, height >> 1, videoFrame.subarray(uOffset, uOffset + vOffset));
        // tslint:disable-next-line: no-bitwise
        this.webglV.fill(width >> 1, height >> 1, videoFrame.subarray(uOffset + vOffset, videoFrame.length));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    public fullscreen() {
        const canvas = this.canvas as any;
        if (canvas.RequestFullScreen) {
            canvas.RequestFullScreen();
        } else if (canvas.webkitRequestFullScreen) {
            canvas.webkitRequestFullScreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        } else {
            alert('This browser doesn\'t supporter fullscreen');
        }
    }

    public exitfullscreen() {
        const tempDocument = document as any;
        if (tempDocument.exitFullscreen) {
            tempDocument.exitFullscreen();
        } else if (tempDocument.webkitExitFullscreen) {
            tempDocument.webkitExitFullscreen();
        } else if (tempDocument.mozCancelFullScreen) {
            tempDocument.mozCancelFullScreen();
        } else if (tempDocument.msExitFullscreen) {
            tempDocument.msExitFullscreen();
        } else {
            alert('Exit fullscreen doesn\'t work');
        }
    }

}
