<script lang="ts">
	import ModuleIcon from '$lib/ModuleIcon.svelte';
	import { MODULES_COLORS } from '$lib/colors';
	import EditIcon from '$lib/icons/EditIcon.svelte';
	import GraphQlModules from '../GraphQLModules.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>
		{data.modules.length === 1 ? `${data.modules[0].displayName}—` : ''}Churros API</title
	>
</svelte:head>
<svelte:body />

<h1>
	{#if data.modules.length === 1}
		{@const module = data.modules[0]}

		<ModuleIcon --module-color={MODULES_COLORS[module.name]} inline name={module.name}></ModuleIcon>

		{module.displayName}

		<a
			class="link-to-source"
			href="https://git.inpt.fr/inp-net/churros/-/blob/main/packages/api/src/modules/{data
				.modules[0].name}/README.md"
		>
			<EditIcon></EditIcon> Un problème sur la doc?
		</a>
	{:else}
		Documentation
	{/if}
</h1>

<GraphQlModules {...data}></GraphQlModules>

<style>
	h1 {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	h1 > :global(*) {
		--icon-color: color-mix(in oklab, var(--module-color) 30%, var(--fg));
	}

	.link-to-source {
		margin-left: auto;
		font-size: 1rem;
		text-decoration: none;
	}
</style>
