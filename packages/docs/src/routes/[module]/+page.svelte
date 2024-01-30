<script lang="ts">
	import type { PageData } from './$types';
	import GraphQlModules from '../GraphQLModules.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.module.displayName}—Churros API</title>
</svelte:head>

<h1>Churros API—Documentation</h1>

<GraphQlModules schema={data.schema} modules={[data.module]}></GraphQlModules>
