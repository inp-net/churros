import { forwardRequest } from '../../forwarder';

export async function GET(event) {
  return forwardRequest('GET', event);
}
