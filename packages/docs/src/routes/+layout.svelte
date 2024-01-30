<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import TableOfContents from '$lib/TableOfContents.svelte';
</script>

<svelte:head>
	<link rel="stylesheet" href="/fonts.css" />
</svelte:head>

<main>
	<TableOfContents
		title={$page.url.pathname === '/'
			? 'Churros API'
			: browser
				? document.title.split('—')[0].trim()
				: $page.route.id === '/[module]'
					? $page.params.module
					: 'Churros API'}
		headingSelector={$page.url.pathname === '/'
			? `:is(h2, [data-toc-include]):not(.toc-exclude)`
			: $page.route.id === '/[module]'
				? `:is(h3, h4, [data-toc-include]):not(.toc-exclude)`
				: `:is(h2, h3, h4, [data-toc-include]):not(.toc-exclude)`}
	></TableOfContents>
	<div class="content">
		<slot />
	</div>
</main>

<style>
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
		padding: 0 2rem;
	}

	:global(a) {
		color: rgb(40, 212, 235);
	}

	:global(a:hover, a:focus-visible) {
		color: rgb(231, 78, 236);
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
