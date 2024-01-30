<script lang="ts">
	import { page } from '$app/stores';
	import type { Arg } from '$lib/schema';

	export let typ: Arg['type'];
	export let inline = false;
	export let nullable = true;
	export let noExpandEnums = false;
	export let invertNullabilitySign = true;
	export let explicitNullabilitySign = false;
	export let underlyingType: Arg['type'] | undefined = undefined;

	export let enumWasExpanded = false;
	$: enumWasExpanded = willExpandEnum(typ);

	$: ({ successTypes, edgeTypes, enumTypes } = $page.data);
	$: enumValues = getEnumValues(typ);

	$: {
		if (typ && typ.kind === 'UNION' && typ.name?.endsWith('Result')) {
			underlyingType ??= successTypes[typ.name?.replace('Result', 'Success')];
		} else if (typ && typ.name?.endsWith('Connection')) {
			underlyingType ??= edgeTypes[`${typ.name}Edge`];
		}
	}

	function getEnumValues(t: Arg['type']) {
		if (t.kind === 'ENUM') return enumTypes[t.name ?? ''];
		return undefined;
	}

	function willExpandEnum(t: Arg['type']) {
		return Boolean(
			t.kind === 'ENUM' &&
				enumValues &&
				!(noExpandEnums || (inline && (getEnumValues(t)?.length ?? 0) > 3) || !enumValues)
		);
	}
</script>

<!-- Need to avoid extraneous whitespace, so the code is ugly like that. Sowwy ._. -->
{#if !typ}(none){:else}{#if typ.kind === 'ENUM'}{#if !enumValues || !willExpandEnum(typ)}<a
				href="#{typ.name}"
				title={(enumValues || []).map((v) => v.name).join(' | ')}
				class="type enum">{typ.name}</a
			>{:else}{#if nullable}({/if}{#each Object.entries(enumValues) as [i, value]}<span
					class="type enum enum-value"
					><svelte:self nullable={false} {inline} {noExpandEnums} typ={value}></svelte:self></span
				>{#if Number(i) < enumValues.length - 1}<span class="type enum enum-value-separator"
						>&nbsp;|&#x20;</span
					>{/if}{/each}{#if nullable}){/if}{/if}{:else if typ.kind === 'INPUT_OBJECT'}<a
			href="#{typ.name}"
			class="type input">{typ.name}</a
		>{:else if typ.kind === 'INTERFACE'}<span class="type interface">{typ.name}</span
		>{:else if typ.kind === 'LIST'}<span class="type array">[</span><svelte:self
			noExpandEnums={true}
			{nullable}
			{inline}
			typ={typ.ofType}
		/><span class="type array">]</span>{:else if typ.kind === 'NON_NULL'}<svelte:self
			{noExpandEnums}
			{inline}
			nullable={false}
			typ={typ.ofType}
		/>{:else if typ.kind === 'OBJECT'}{#if typ.name?.endsWith('Connection') && underlyingType}<span
				class="type connection"
				><a class="type connection" href="/#types/special/connection">Connection</a>&lt;<svelte:self
					{noExpandEnums}
					{inline}
					{nullable}
					typ={underlyingType}
				></svelte:self>&gt;</span
			>{:else}<a class="type object" href="#{typ.name}">{typ.name}</a
			>{/if}{:else if typ.kind === 'SCALAR'}<span class="type scalar">{typ.name}</span
		>{:else if typ.kind === 'UNION'}{#if typ.name?.endsWith('Result') && underlyingType}<span
				class="type errorable"
				><a class="type errorable" href="/#types/special/results-type">Result</a>&lt;<svelte:self
					{inline}
					{noExpandEnums}
					{nullable}
					typ={underlyingType}
				></svelte:self>&gt;</span
			>{:else}<type class="union">{typ.name}</type>{/if}{:else}<span class="type unknown"
			>{typ.name}</span
		>{/if}<span class:nullable class:non-nullable={typ.kind === 'NON_NULL'}
		>{#if invertNullabilitySign}{#if typ.kind !== 'NON_NULL' && nullable}{#if explicitNullabilitySign}&nbsp;|&#x20;null{:else}<span
						title="Peut être null">?</span
					>{/if}{/if}{:else if typ.kind === 'NON_NULL'}!{/if}</span
	>{/if}

<style>
	.connection {
		color: var(--magenta);
	}

	.scalar {
		color: var(--orange);
	}

	.enum {
		color: var(--yellow);
	}

	.enum.enum-value-separator {
		font-weight: bold;
		color: var(--fg);
	}

	.object {
		color: var(--blue);
	}

	.union {
		color: var(--pink);
	}

	.errorable,
	.nullable {
		font-weight: bold;
		color: var(--red);
	}

	.array {
		font-weight: bold;
		color: var(--fg);
	}

	.input {
		color: var(--cyan);
	}
</style>
