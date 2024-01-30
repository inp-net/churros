<script lang="ts">
	import ModuleIcon from '$lib/ModuleIcon.svelte';
	import { MODULES_COLORS } from '$lib/colors';

	import ModuleAllIcon from '$lib/icons/ModuleAllIcon.svelte';
	import type { Module } from '$lib/server/modules';

	export let modules: Module[];
</script>

<section class="modules-list">
	{#each modules as module}
		<a
			style:--color="var(--{MODULES_COLORS[module.name] ?? 'fg'})"
			href="/{module.name}"
			class="module-link"
		>
			<div class="card">
				<h4>
					<ModuleIcon big name={module.name}></ModuleIcon>
					{module.displayName}
				</h4>
				<p>{module.shortDescription}</p>
			</div>
		</a>
	{/each}
	<a href="/all" class="module-link" style:--color="var(--fg)">
		<div class="card">
			<h4>
				<div class="icon">
					<ModuleAllIcon />
				</div>
				Tout
			</h4>
			<p>Tout sur une seule page</p>
		</div>
	</a>
</section>

<style>
	.modules-list {
		--card-width: 223px;
		--card-height: 200px;

		display: grid;
		grid-template-columns: repeat(auto-fill, calc(min(var(--card-width), 100%)));
		gap: 1.5rem;
		justify-content: center;
	}

	.card {
		box-sizing: border-box;
		width: 100%;

		/* background-color: var(--shadow); */
		height: 100%;
		padding: 1rem;
		overflow: hidden;
		color: color-mix(in oklab, var(--color) 30%, var(--fg));
		background-color: var(--shadow);
		border: 2px solid var(--color);
		border-radius: 0.5rem;
		transition: all 0.2s ease;

		--icon-color: color-mix(in oklab, var(--color) 70%, var(--fg));
	}

	a:has(.card):hover .card,
	a:has(.card):focus-within .card {
		background-color: color-mix(in oklab, var(--color) 40%, var(--shadow));
		border-color: var(--color);
	}

	a:has(.card) {
		display: block;
		width: calc(min(var(--card-width), 100%));
		height: var(--card-height);
		color: inherit;
		text-decoration: none;
	}

	.card h4 {
		margin-top: 0.125rem;
	}

	.card p {
		font-size: 0.85em;
		text-overflow: ellipsis;
	}
</style>
