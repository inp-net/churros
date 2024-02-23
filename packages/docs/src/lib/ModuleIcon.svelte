<script lang="ts">
	import { kebabToPascal } from './casing';
	import { MODULES_COLORS } from './colors';

	export let name: string;
	export let inline = false;
	export let big = false;
</script>

{#await import(`$lib/icons/Module${kebabToPascal(name.replace('.', ''))}Icon.svelte`) then icon}
	<div
		class:inline
		class:big
		class="icon"
		{...$$restProps}
		style:--color="var(--{MODULES_COLORS[name]})"
	>
		<svelte:component this={icon.default} />
	</div>
{/await}

<style>
	.icon.inline {
		width: 1em;
		height: 1em;
		margin-right: 0.5em;
	}

	.icon.big {
		width: 1em;
		height: 1.2em;
		font-size: 1.5em;
	}

	.icon {
		color: var(--icon-color, currentColor);
	}
</style>
