import * as qrcode from 'qr-code-generator-lib';

export function renderQRCode(data: string): { path: string; viewbox: string } {
  const { d: path, dim } = qrcode.renderPath(qrcode.getMatrix(data));
  const builtinPadding = 4;
  const viewbox = `${builtinPadding} ${builtinPadding} ${dim - 2 * builtinPadding} ${dim - 2 * builtinPadding}`;
  return { path, viewbox };
}
