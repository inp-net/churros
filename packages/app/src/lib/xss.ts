import xss_ from 'xss';

export function xss(content: string) {
  return xss_(content) as App.XSSSafeHTMLString;
}
