declare module "jsqr" {
  interface QRCodePoint {
    x: number;
    y: number;
  }

  interface QRCode {
    binaryData: number[];
    data: string;
    location: {
      topLeftCorner: QRCodePoint;
      topRightCorner: QRCodePoint;
      bottomLeftCorner: QRCodePoint;
      bottomRightCorner: QRCodePoint;
    };
  }

  interface Options {
    inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" | "invertFirst";
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: Options
  ): QRCode | null;
}
