<script lang="ts">
	import LinkIcon from './LinkIcon.svelte';

	export let hash: string | undefined;
	export let element: string = 'h4';
</script>

<svelte:element this={element} class="header" id={hash} {...$$restProps}>
	{#if hash}
		<a class="hash-link" href="#{hash}">
			<LinkIcon></LinkIcon>
		</a>
	{/if}
	<div class="header-content">
		<slot />
	</div>
</svelte:element>

<style>
	.hash-link {
		opacity: 0.25;
		transition: opacity 0.2s ease;
		font-size: 1.2em;
		color: white;
		margin-bottom: -0.25em;
	}
	h4:hover .hash-link,
	h4:focus-visible .hash-link {
		opacity: 1;
		color: white;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 1em;
	}

	@media (max-width: 1000px) {
		.header-content {
			overflow-x: auto;
			overflow-y: hidden;
		}
	}
</style>
