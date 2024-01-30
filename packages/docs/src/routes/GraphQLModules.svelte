<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import EditIcon from '$lib/EditIcon.svelte';
	import ExternalLinkIcon from '$lib/ExternalLinkIcon.svelte';
	import HashLink from '$lib/HashLink.svelte';
	import { markdownToHtml } from '$lib/markdown';
	import type { Schema } from '$lib/schema';
	import {
		findMutationInSchema,
		findQueryInSchema,
		findSubscriptionInSchema,
		findTypeInSchema
	} from '$lib/schema-utils';
	import type { Module } from '$lib/server/modules';
	import Query from './Query.svelte';

	export let schema: Schema;
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
	<section class="module" id={name}>
		{#if renderTitle}
			<h2>
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
			</h2>
		{/if}
		{@html renderedDocs}
		{#if types.length > 0}
			<svelte:element this={renderTitle ? 'h3' : 'h2'} id="{name}/types">Types</svelte:element>
			{#each types as typeName}
				{@const type = findTypeInSchema(schema, typeName)}
				{#if type}
					<article>
						<section class="doc">
							<HashLink element={renderTitle ? 'h4' : 'h3'} hash={typeName}>
								<code>{typeName}</code>
							</HashLink>
							{#await markdownToHtml(type.description ?? '', $page.data.allResolvers) then doc}
								{@html doc}
							{:catch error}
								<p>Impossible de rendre la documentation pour {typeName}: {error}</p>
							{/await}
						</section>
						<section class="fields">
							<ul>
								{#each type.fields ?? [] as field}
									<li>
										<Query kind="field" query={field}></Query>
									</li>
								{/each}
							</ul>
						</section>
					</article>
				{:else if dev}
					<article class="error"><code>{typeName}</code> non trouvée dans le schéma.</article>
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
					<article class="error"><code>{queryName}</code> non trouvée dans le schéma.</article>
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
					<article class="error"><code>{mutationName}</code> non trouvée dans le schéma.</article>
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
					<article class="error"><code>{subscription}</code> non trouvée dans le schéma.</article>
				{/if}
			{/each}
		{/if}
	</section>
{/each}

<style>
	h2 {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		column-gap: 1em;
	}

	h2 > a {
		font-size: 1rem;
		text-decoration: none;
	}
	h2 .link-to-source {
		margin-left: auto;
	}


</style>
