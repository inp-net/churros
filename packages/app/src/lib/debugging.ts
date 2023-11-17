import { browser } from '$app/environment';
import { syncToSessionStorage } from 'svelte-store2storage';
import { writable } from 'svelte/store';

export const debugging = writable(false);

if (browser) syncToSessionStorage(debugging, 'debugging');
