import { getServerManifest } from '$lib/servmanifest';

export function getAuthUrl(): string {
  const manifest = getServerManifest();
  return manifest.urls.auth;
}

export function getApiUrl(): string {
  const manifest = getServerManifest();
  return manifest.urls.api;
}
