// See https://kit.svelte.dev/docs/types#app

import type { LayoutServerData } from './routes/$types';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData extends LayoutServerData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
