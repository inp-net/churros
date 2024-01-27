/**
 * Returns true if the server is running in development mode.
 */
export function inDevelopment() {
  return process.env['NODE_ENV'] === 'development';
}
