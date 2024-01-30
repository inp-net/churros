<script lang="ts">
	import type { Schema } from '$lib/schema';
	import type { Module } from '$lib/server/modules';
	import HashLink from '$lib/HashLink.svelte';
	import { markdownToHtml } from '$lib/markdown';
	import {
		findMutationInSchema,
		findQueryInSchema,
		findSubscriptionInSchema,
		findTypeInSchema
	} from '$lib/schema-utils';
	import Query from './Query.svelte';
	import { dev } from '$app/environment';
	import ExternalLinkIcon from '$lib/ExternalLinkIcon.svelte';
	import { page } from '$app/stores';

	export let schema: Schema;
	export let modules: Module[];

	function isImplicitSubscription(queryName: string) {
		return modules.some(
			({ subscriptions }) =>
				!subscriptions.includes(queryName) && findSubscriptionInSchema(schema, queryName)
		);
	}
</script>

{#each modules as { name, docs, types, queries, mutations, subscriptions }}
	<section class="module" id={name}>
		{#await markdownToHtml(docs) then rendered}
			{@html rendered}
		{:catch error}
			<p>Impossible de rendre la documentation pour {name}: {error}</p>
		{/await}
		{#if $page.url.pathname === '/'}
			<p>
				<a href="/{name}" class="link-to-page">
					<ExternalLinkIcon></ExternalLinkIcon> Page
				</a>
			</p>
		{/if}
		{#if types.length > 0}
			<h3 id="{name}/types">Types</h3>
			{#each types as typeName}
				{@const type = findTypeInSchema(schema, typeName)}
				{#if type}
					<article>
						<section class="doc">
							<HashLink hash={typeName}>
								<code>{typeName}</code>
							</HashLink>
							{#await markdownToHtml(type.description ?? '') then doc}
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
			<h3 id="{name}/queries">Queries</h3>
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
			<h3 id="{name}/mutations">Mutations</h3>
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
			<h3 id="{name}/subscriptions">Subscriptions</h3>
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
