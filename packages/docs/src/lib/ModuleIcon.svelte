<script lang="ts">
	import { kebabToPascal } from './casing';
	import { MODULES_COLORS } from './colors';

	export let name: string;
	export let inline = false;
</script>

{#await import(`$lib/icons/Module${kebabToPascal(name.replace('.', ''))}Icon.svelte`) then icon}
	<div class:inline class="icon" {...$$restProps} style:--color="var(--{MODULES_COLORS[name]})">
		<svelte:component this={icon.default} />
	</div>
{/await}

<style>
	.icon.inline {
		width: 1em;
		height: 1em; /* if width == height, the icon is not vertically centered */
		margin-right: -0.5em;
	}
</style>
