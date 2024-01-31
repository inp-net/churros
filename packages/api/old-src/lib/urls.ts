export function isLocalNetwork(url: URL | string) {
  const hostname = new URL(url).hostname;
  return (
    ['localhost', '127.0.0.1', '', '::1'].includes(hostname) ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local')
  );
}
