<script lang="ts">
	import EditIcon from '$lib/EditIcon.svelte';
	import GraphQlModules from '../GraphQLModules.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.modules.length === 1 ? `${data.modules[0].displayName}—` : ''}Churros API</title>
</svelte:head>
<h1>
	{#if data.modules.length === 1}
		{data.modules[0].displayName}
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
		justify-content: space-between;
		margin-bottom: 0;
	}

	.link-to-source {
		font-size: 1rem;
		text-decoration: none;
	}
</style>
