import { forwardRequest } from '../forwarder.js';

export async function POST(event) {
  return forwardRequest('POST', event);
}

export async function GET(event) {
  return forwardRequest('GET', event);
}
