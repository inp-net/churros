// import { browser } from '$app/environment';
// import { syncToLocalStorage } from 'svelte-store2storage';
import { writable } from 'svelte/store';

export const ackownledgedChangelogVersions = writable([] as string[]);

// if (browser) syncToLocalStorage(ackownledgedChangelogVersions, 'ackownledgedChangelogVersions');
