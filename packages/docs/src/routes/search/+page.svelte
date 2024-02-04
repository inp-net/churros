<script lang="ts">
	import { page } from '$app/stores';
	import ModuleCard from '$lib/ModuleCard.svelte';
	import Fuse from 'fuse.js';
	import Query from '../Query.svelte';
	import TypeDef from '../TypeDef.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ modules, mutations, queries, types } = data);

	$: query = $page.url.searchParams.get('q') || '';

	function search(searchQuery: string) {
		if (searchQuery.length < 3) return { resultsCount: 0, results: [], modulesResults: [] };
		const modulesResults = new Fuse(modules, {
			keys: [
				{ name: 'name', weight: 2 },
				{ name: 'displayName', weight: 2 },
				{ name: 'description', weight: 0.5 }
			],
			includeMatches: true,
			includeScore: true,
			threshold: 0.2
		}).search(searchQuery);
		const results = new Fuse([...queries, ...mutations, ...types], {
			keys: [
				{ name: 'name', weight: 4 },
				{ name: 'type', weight: 1 },
				{ name: 'description', weight: 2 },
				{ name: 'args.name', weight: 1 },
				{ name: 'args.description', weight: 0.5 },
				{ name: 'module.name', weight: 0.3 },
				{ name: 'module.displayName', weight: 0.3 },
				{ name: 'module.description', weight: 0.25 }
			],
			includeScore: true,
			includeMatches: true,
			threshold: 0.2
		}).search(searchQuery);
		return {
			resultsCount: results.length + modulesResults.length,
			results,
			modulesResults
		};
	}

	$: ({ resultsCount, results, modulesResults } = search(query));
</script>

<svelte:head>
	<title>Recherche—Churros API</title>
</svelte:head>

<h1>Recherche de “{query}”</h1>
{#if resultsCount > 0}
	<p class="results-count">
		{resultsCount} résultat{resultsCount === 1 ? '' : 's'}
	</p>
{/if}

{#each modulesResults as { item }}
	<ModuleCard module={item}></ModuleCard>
{/each}

<!-- {#if modulesResults.length > 0 && results.length > 0}
	<hr />
{/if} -->

{#each results as { item }}
	{#if item.isType}
		<TypeDef moduleName={item.module.name} type={item}></TypeDef>
	{:else}
		<Query kind={item.kind} query={item}></Query>
	{/if}
{:else}
	<p class="no-results">Aucun résultat.</p>
	<a href="/">Retour à l'accueil</a>
{/each}

<style>
	h1 {
		margin-bottom: 0;
	}

	.results-count {
		margin-top: 0;
		margin-bottom: 2rem;
	}
</style>
