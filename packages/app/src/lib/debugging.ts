import { browser } from '$app/environment';
import { syncToLocalStorage } from 'svelte-store2storage';
import { writable } from 'svelte/store';

export const debugging = writable(false);

if (browser) syncToLocalStorage(debugging, 'debugging');
