import throttle from 'lodash.throttle';
import type { Writable } from 'svelte/store';

export default function debounced<T>(store: Writable<T>, cooldown = 100): Writable<T> {
	return {
		subscribe: store.subscribe,
		set: throttle(store.set, cooldown),
		update: throttle(store.update, cooldown)
	};
}
