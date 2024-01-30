<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import TableOfContents from '$lib/TableOfContents.svelte';
	import { CURRENT_COMMIT, CURRENT_VERSION } from '@centraverse/api/new-src/lib/buildinfo';
</script>

<svelte:head>
	<link rel="stylesheet" href="/fonts.css" />
</svelte:head>

<main>
	<TableOfContents
		title={$page.url.pathname === '/'
			? undefined
			: browser
				? document.title.split('—')[0].trim()
				: $page.route.id === '/[module]'
					? $page.params.module
					: 'Churros API'}
		headingSelector={$page.url.pathname === '/'
			? `:is(h2, [data-toc-include]):not(.toc-exclude)`
			: `:is(h2, h3, h4, [data-toc-include]):not(.toc-exclude)`}
	></TableOfContents>
	<div class="content">
		<slot />
		<footer>
			<img src="https://churros.inpt.fr/logo-masked.png" alt="Churros Logo" />
			<p>
				Churros API, version {CURRENT_VERSION} (at
				<a href="https://git.inpt.fr/inp-net/churros/-/commit/{CURRENT_COMMIT}">
					<code>{CURRENT_COMMIT.slice(0, 10)}</code>
				</a>)
			</p>
			<a class="net7" href="https://net7.dev"
				>Made with <span style:color="red"><strong>&lt;3</strong></span> by
				<img src="https://churros.inpt.fr/storage/groups/dark/net7-n7.png" alt="net7" /></a
			>
		</footer>
	</div>
</main>

<style>
	:root {
		--side-padding: 2rem;
	}
	main {
		display: grid;
		--toc-width: 250px;
		grid-template-columns: var(--toc-width) 1fr;
		--toc-li-hover-color: aqua;
		--toc-active-bg: white;
		--toc-active-color: #050d1b;
		--toc-mobile-bg: #0a192f;
		max-width: 1000px;
		gap: 2rem;
		margin: 0 auto;
		padding: 0 var(--side-padding);
	}

	footer {
		border-top: #0a192f 5px solid;
		/* border-radius: 10000px; */
		padding: 5rem;
		padding-bottom: 1rem;
		margin-top: 5rem;
		text-align: center;
	}

	footer img {
		width: 50px;
	}

	.net7 {
		display: flex;
		margin-top: 5rem;
		align-items: center;
		column-gap: 1ch;
		flex-wrap: wrap;
		justify-content: center;
		text-decoration: none;
		color: white;
		font-family: 'Space Mono';
		transition: box-shadow 0.2s ease;
		border-radius: 2rem;
	}

	.net7:hover,
	.net7:focus-visible {
		box-shadow: 0 0 50px 3px color-mix(in oklab, white 15%, #0a192f );
	}

	.net7 img {
		width: 100px;
		margin-left: 1em;
	}

	:global(a) {
		color: rgb(40, 212, 235);
	}

	:global(a:hover, a:focus-visible) {
		color: rgb(231, 78, 236);
	}

	:global(pre) {
		overflow-x: auto;
	}
	.content {
		max-width: calc(100vw - 2 * var(--side-padding));
	}

	@media (max-width: 1000px) {
		main {
			grid-template-columns: 1fr;
		}
	}

	:global(body) {
		background: #050d1b;
		color: white;
		font-family: 'Space Grotesk', 'Roboto', sans-serif;
	}

	:global(code) {
		font-family: 'Space Mono', monospace;
	}

	:global(h4) {
		margin: 0.5rem 0;
	}
	:global(p) {
		margin: 0.125rem 0;
	}

	:global(article) {
		padding: 1rem;
		border-radius: 1.5rem;
		/* background: #0a192f; */
		margin: 2rem 0;
	}

	:global(article.error) {
		background: #460808;
		color: #f39d9d;
		text-align: center;
	}
</style>
