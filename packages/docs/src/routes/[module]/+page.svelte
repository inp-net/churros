<script lang="ts">
	import type { PageData } from './$types';
	import GraphQlModules from '../GraphQLModules.svelte';
	import EditIcon from '$lib/EditIcon.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.module.displayName}—Churros API</title>
</svelte:head>

<h1>{data.module.displayName}
<a
	class="link-to-source"
	href="https://git.inpt.fr/inp-net/churros/-/blob/main/packages/api/src/modules/{data
		.module.name}/README.md"
>
	<EditIcon></EditIcon> Un problème sur la doc?
</a></h1>

<GraphQlModules schema={data.schema} modules={[data.module]}></GraphQlModules>

<style>
	h1 {
		margin-bottom: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.link-to-source {
		font-size: 1rem;
		text-decoration: none;
	}
</style>
