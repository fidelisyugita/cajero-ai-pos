declare module 'esc-pos-encoder' {
  export default class EscPosEncoder {
    constructor();
    initialize(): this;
    codepage(codepage: string): this;
    text(text: string): this;
    newline(): this;
    line(text: string): this;
    underline(active?: boolean): this;
    bold(active?: boolean): this;
    align(align: 'left' | 'center' | 'right'): this;
    invert(active?: boolean): this;
    cut(partial?: boolean): this;
    raw(data: number[]): this;
    image(image: any, width: number, height: number, algorithm?: string, threshold?: number): this;
    qrcode(url: string, model?: number, size?: number, errorLevel?: string): this;
    barcode(code: string, type: string, height: number): this;
    encode(): Uint8Array;
  }
}
