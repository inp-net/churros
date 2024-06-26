
export function withTrailingSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}

export function withoutTrailingSlash(path: string) {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}
