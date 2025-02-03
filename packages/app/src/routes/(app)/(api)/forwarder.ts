import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

export async function forwardRequest<T extends RequestEvent>(
  method: 'POST' | 'GET',
  { request, url }: T,
) {
  const backend = new URL(env.PRIVATE_API_URL);

  console.info(`${method} ${url} -> ${swapOrigins(url, backend)}`);

  return fetch(swapOrigins(url, backend), {
    method,
    headers: request.headers,
    body: request.body,
    // @ts-expect-error option missing from type
    duplex: 'half',
  });
}

function swapOrigins(subject: URL, takeFrom: URL) {
  return new URL(subject.toString().replace(subject.origin, takeFrom.origin));
}
