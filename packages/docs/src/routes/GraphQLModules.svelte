<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import ModuleIcon from '$lib/ModuleIcon.svelte';
	import { MODULES_COLORS } from '$lib/colors';
	import EditIcon from '$lib/icons/EditIcon.svelte';
	import ExternalLinkIcon from '$lib/icons/ExternalLinkIcon.svelte';
	import { type SchemaClass } from '$lib/schema';
	import {
		findMutationInSchema,
		findQueryInSchema,
		findSubscriptionInSchema,
		findTypeInSchema
	} from '$lib/schema-utils';
	import type { Module } from '$lib/server/modules';
	import Query from './Query.svelte';
	import TypeDef from './TypeDef.svelte';

	export let schema: SchemaClass;
	export let modules: Module[];
	export let renderTitle: boolean = modules.length > 1;

	function isImplicitSubscription(queryName: string) {
		return modules.some(
			({ subscriptions }) =>
				!subscriptions.includes(queryName) && findSubscriptionInSchema(schema, queryName)
		);
	}
</script>

{#each modules as { name, displayName, renderedDocs, types, queries, mutations, subscriptions }}
	<section class="module" id={name} style:--color="var(--{MODULES_COLORS[name]})">
		{#if renderTitle}
			<h2 data-toc-title={displayName}>
				<ModuleIcon inline {name}></ModuleIcon>

				{displayName}

				{#if $page.url.pathname !== `/${name}`}
					<a href="/{name}" class="link-to-page">
						<ExternalLinkIcon></ExternalLinkIcon> Page
					</a>
				{/if}

				<a
					class="link-to-source"
					href="https://git.inpt.fr/inp-net/churros/-/blob/main/packages/api/src/modules/{name}/README.md"
				>
					<EditIcon></EditIcon> Un problème sur la doc?
				</a>
				<a
					href="https://git.inpt.fr/inp-net/churros/-/tree/main/packages/api/src/modules/{name}"
					class="source-code">[src]</a
				>
			</h2>
		{/if}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html renderedDocs}
		{#if types.length > 0}
			<svelte:element this={renderTitle ? 'h3' : 'h2'} id="{name}/types">Types</svelte:element>
			{#each types as typeName}
				{@const type = findTypeInSchema(schema, typeName)}
				{#if type}
					<TypeDef moduleName={name} {type} {renderTitle} />
				{:else if dev}
					<article class="error">
						<code class="no-color">{typeName}</code> non trouvée dans le schéma.
					</article>
				{/if}
			{/each}
		{/if}
		{#if queries.length > 0}
			<svelte:element this={renderTitle ? 'h3' : 'h2'} id="{name}/queries">Queries</svelte:element>
			{#each queries as queryName}
				{@const query = findQueryInSchema(schema, queryName)}
				{#if query}
					<Query
						{query}
						kind="query"
						hasAvailableSubscription={isImplicitSubscription(queryName)}
					/>
				{:else if dev}
					<article class="error">
						<code class="no-color">{queryName}</code> non trouvée dans le schéma.
					</article>
				{/if}
			{/each}
		{/if}
		{#if mutations.length > 0}
			<svelte:element this={renderTitle ? 'h3' : 'h2'} id="{name}/mutations"
				>Mutations</svelte:element
			>
			{#each mutations as mutationName}
				{@const query = findMutationInSchema(schema, mutationName)}
				{#if query}
					<Query {query} kind="mutation" />
				{:else if dev}
					<article class="error">
						<code class="no-color">{mutationName}</code> non trouvée dans le schéma.
					</article>
				{/if}
			{/each}
		{/if}
		{#if subscriptions.length > 0}
			<svelte:element this={renderTitle ? 'h3' : 'h2'} id="{name}/subscriptions"
				>Subscriptions</svelte:element
			>
			{#each subscriptions as subscription}
				{@const query = findSubscriptionInSchema(schema, subscription)}
				{#if query}
					<Query {query} kind="subscription" />
				{:else if dev}
					<article class="error">
						<code class="no-color">{subscription}</code> non trouvée dans le schéma.
					</article>
				{/if}
			{/each}
		{/if}
	</section>
{/each}

<style>
	h2 {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1em;
		align-items: center;
	}

	[data-toc-title] {
		color: color-mix(in oklab, var(--color) 60%, var(--fg));
	}

	.source-code {
		margin-left: 2em;
		font-size: 1rem;
	}

	h2 > a {
		font-size: 1rem;
		text-decoration: none;
	}

	h2 .link-to-source {
		margin-left: auto;
	}
</style>
