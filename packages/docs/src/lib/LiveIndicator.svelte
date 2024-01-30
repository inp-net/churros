<script>
	import { page } from '$app/stores';
	import Pill from './Pill.svelte';
</script>

<svelte:element
	this={$page.url.pathname === '/websockets' ? 'span' : 'a'}
	href="/websockets"
	class="live-indicator"
	title="Disponible aussi comme une subscription"
>
	<Pill noInteractions={$page.url.pathname === '/websockets'}><span class="dot"></span> LIVE</Pill>
</svelte:element>

<style>
	.live-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: rgb(255 49 118);
		text-decoration: none;
	}

	.dot::before {
		display: inline-block;
		width: 0.7em;
		height: 0.7em;
		content: '';
		background: currentcolor;
		border-radius: 100000px;
	}
</style>
