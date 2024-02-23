<script lang="ts">
	import { page } from '$app/stores';
	import HashLink from '$lib/HashLink.svelte';
	import TypeKindIndicator from '$lib/TypeKindIndicator.svelte';
	import { pascalToKebab } from '$lib/casing';
	import { markdownToHtml } from '$lib/markdown';
	import { Kind, type SchemaType } from '$lib/schema';
	import ArgType from './ArgType.svelte';
	import Query from './Query.svelte';

	export let type: SchemaType;
	export let renderTitle = false;
	export let moduleName: string;
	$: fields = type?.fields ?? type?.inputFields ?? [];
</script>

<article>
	<section class="doc">
		<HashLink data-toc-title={type.name} element={renderTitle ? 'h4' : 'h3'} hash={type.name}>
			<TypeKindIndicator kind={type.kind}></TypeKindIndicator>
			<code class="no-color">{type.name}</code>
			<a
				href="https://git.inpt.fr/inp-net/churros/-/tree/main/packages/api/src/modules/{moduleName}/types/{pascalToKebab(
					type.name
				)}.ts"
				class="source-code">[src]</a
			>
		</HashLink>
		{#await markdownToHtml(type.description ?? '', $page.data.allResolvers) then doc}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html doc}
		{:catch error}
			<p>Impossible de rendre la documentation pour {type.name}: {error}</p>
		{/await}
	</section>
	<section class="fields">
		{#if fields.length > 0}
			<ul>
				{#each fields as field}
					<li>
						<Query kind="field" query={{ args: [], ...field }}></Query>
					</li>
				{/each}
			</ul>
		{:else if type.kind === Kind.Enum}
			<ul>
				{#each type.enumValues ?? [] as { name, description }}
					<li>
						<code class="no-color">
							{#if description}
								<strong>{name}</strong>
							{:else}{name}{/if}
						</code>
						<div class="doc">
							{#await markdownToHtml(description ?? '', $page.data.allResolvers) then doc}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html doc}
							{:catch error}
								<p>Impossible de rendre la documentation pour {name}: {error}</p>
							{/await}
						</div>
					</li>
				{/each}
			</ul>
		{:else if type.kind === Kind.Union}
			{@const possibleTypes = (type.possibleTypes ?? [])
				.map((t) => $page.data.types[t.name ?? ''])
				.filter(Boolean)}
			<ul>
				{#each possibleTypes as t}
					<li>
						<ArgType nullable={false} typ={{ ...t, ofType: null }}></ArgType>
						<div class="doc">
							{#await markdownToHtml(t.description ?? '', $page.data.allResolvers) then doc}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html doc}
							{:catch error}
								<p>Impossible de rendre la documentation pour {moduleName}: {error}</p>
							{/await}
						</div>
					</li>
				{/each}
			</ul>
		{:else if type.kind !== 'SCALAR'}
			<ArgType nullable={false} typ={{ ...$page.data.types[type.name], ofType: null }}></ArgType>
		{/if}
	</section>
</article>

<style>
	.source-code {
		margin-left: 1em;
	}
</style>
