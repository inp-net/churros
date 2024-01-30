<!-- From https://github.com/janosh/svelte-toc, MIT-licensed. -->
<script lang="ts">
	import { page } from '$app/stores';
	import SearchIcon from '$lib/icons/SearchIcon.svelte';
	import debounced from '$lib/stores';
	import { onMount } from 'svelte';
	import { useParamStore } from 'svelte-param-store';
	import { blur, type BlurParams } from 'svelte/transition';
	import MenuIcon from './icons/MenuIcon.svelte';
	import { browser } from '$app/environment';

	export let activeHeading: HTMLHeadingElement | null = null;
	export let activeHeadingScrollOffset: number = 100;
	export let activeTocLi: HTMLLIElement | null = null;
	export let aside: HTMLElement | undefined = undefined;
	export let breakpoint: number = 1000;
	export let desktop: boolean = true;
	export let flashClickedHeadingsFor: number = 1500;
	export let getHeadingIds = (node: HTMLHeadingElement): string => node.id;
	export let getHeadingLevels = (node: HTMLHeadingElement): number => Number(node.nodeName[1]); // get the number from H1, H2, ...
	export let getHeadingTitles = (node: HTMLHeadingElement): string =>
		node.dataset.tocTitle || node.firstChild?.textContent || node?.textContent || ``;
	// the result of document.querySelectorAll(headingSelector). can be useful for binding
	export let headings: HTMLHeadingElement[] = [];
	export let headingSelector: string = `:is(h2, [data-toc-include]):not(.toc-exclude)`;
	export let hide: boolean = false;
	export let autoHide: boolean = false;
	export let keepActiveTocItemInView: boolean = true; // requires scrollend event browser support
	export let minItems: number = 0;
	export let nav: HTMLElement | undefined = undefined;
	export let open: boolean = false;
	export let openButtonLabel: string = `Ouvrir la table des matières`;
	export let pageBody: string | HTMLElement = `body`;
	export let scrollBehavior: 'auto' | 'smooth' = `smooth`;
	export let titleTag: string = `h2`;
	export let tocItems: HTMLLIElement[] = [];
	export let warnOnEmpty: boolean = true;
	export let blurParams: BlurParams | undefined = { duration: 200 };
	export let title = 'Accueil';

	let window_width: number;

	$: searchQuery = browser ? debounced(useParamStore('q'), 20) : undefined;

	$: levels = headings.map(getHeadingLevels);
	$: minLevel = Math.min(...levels);
	$: desktop = window_width > breakpoint;

	function close(event: MouseEvent) {
		if (!aside?.contains(event.target as Node)) open = false;
	}

	// (re-)query headings on mount and on route changes
	function requery_headings() {
		if (typeof document === `undefined`) return; // for SSR
		headings = [...document.querySelectorAll(headingSelector)] as HTMLHeadingElement[];
		set_active_heading();
		if (headings.length === 0) {
			if (warnOnEmpty) {
				console.warn(
					`svelte-toc found no headings for headingSelector='${headingSelector}'. ${
						autoHide ? `Hiding` : `Showing empty`
					} table of contents.`
				);
			}
			if (autoHide) hide = true;
		} else if (hide && autoHide) {
			hide = false;
		}
	}

	requery_headings();

	onMount(() => {
		if (typeof pageBody === `string`) {
			pageBody = document.querySelector(pageBody) as HTMLElement;

			if (!pageBody) {
				throw new Error(`Could not find page body element: ${pageBody}`);
			}
		}
		const mutation_observer = new MutationObserver(requery_headings);
		mutation_observer.observe(pageBody, { childList: true, subtree: true });
		return () => mutation_observer.disconnect();
	});
	function set_active_heading() {
		let idx = headings.length;
		while (idx--) {
			const { top } = headings[idx].getBoundingClientRect();

			// loop through headings from last to first until we find one that the viewport already
			// scrolled past. if none is found, set make first heading active
			if (top < activeHeadingScrollOffset || idx === 0) {
				activeHeading = headings[idx];
				activeTocLi = tocItems[idx];
				return; // exit while loop if updated active heading
			}
		}
	}

	const handler = (node: HTMLHeadingElement) => (event: MouseEvent | KeyboardEvent) => {
		if (event instanceof KeyboardEvent && ![`Enter`, ` `].includes(event.key)) return;
		open = false;
		node.scrollIntoView({ behavior: scrollBehavior, block: `start` });

		const id = getHeadingIds && getHeadingIds(node);
		if (id) history.replaceState({}, ``, `#${id}`);

		if (flashClickedHeadingsFor) {
			node.classList.add(`toc-clicked`);
			setTimeout(() => node.classList.remove(`toc-clicked`), flashClickedHeadingsFor);
		}
	};
</script>

<svelte:window
	bind:innerWidth={window_width}
	on:scroll={set_active_heading}
	on:click={close}
	on:scrollend={() => {
		// wait for scroll end since Chrome doesn't support multiple simultaneous scrolls,
		// smooth or otherwise (https://stackoverflow.com/a/63563437)
		if (keepActiveTocItemInView && activeTocLi) {
			// scroll the active ToC item into the middle of the ToC container
			nav?.scrollTo?.({
				top: activeTocLi?.offsetTop - nav.offsetHeight / 2,
				behavior: `smooth`
			});
		}
	}}
/>

<aside
	class="toc"
	class:desktop
	class:hidden={hide}
	class:mobile={!desktop}
	bind:this={aside}
	hidden={hide}
	aria-hidden={hide}
>
	{#if !open && !desktop && headings.length >= minItems}
		<button
			on:click|preventDefault|stopPropagation={() => (open = true)}
			aria-label={openButtonLabel}
		>
			<slot name="open-toc-icon">
				<MenuIcon width="1em" />
			</slot>
		</button>
	{/if}
	{#if open || (desktop && headings.length >= minItems)}
		<nav transition:blur={blurParams} bind:this={nav}>
			<p class="suptitle">
				<img src="https://churros.inpt.fr/logo-masked.png" alt="Churros Logo" />
				Churros API
				{#if $page.url.pathname !== '/'}
					<a class="back" href="/">← Retour</a>
				{/if}
			</p>
			<search>
				<form action="/search" method="get">
					<input
						placeholder="Rechercher…"
						bind:value={$searchQuery}
						name="q"
						type="search"
					/><button type="submit">
						<SearchIcon></SearchIcon>
					</button>
				</form>
			</search>
			{#if title}
				<slot name="title">
					<svelte:element this={titleTag} class="toc-title toc-exclude">
						{title}
					</svelte:element>
				</slot>
			{/if}
			<ol>
				{#each headings as heading, idx}
					<li
						style:margin="0 0 0 {levels[idx] - minLevel}em"
						style:font-size="{2 - 0.2 * (levels[idx] - minLevel)}ex"
						class:active={activeHeading === heading}
						on:click={handler(heading)}
						on:keyup={handler(heading)}
						bind:this={tocItems[idx]}
						role="menuitem"
					>
						<slot name="toc-item" {heading} {idx}>
							{getHeadingTitles(heading)}
						</slot>
					</li>
				{/each}
			</ol>
		</nav>
	{/if}
</aside>

<style>
	.suptitle {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		align-items: center;
		margin: 0;
		margin-bottom: 1rem;
		font-size: 1.2rem;
		font-weight: bold;
	}

	search {
		margin: 1rem 0;
	}

	search form {
		display: flex;
		font-size: 1em;
	}

	search input {
		flex-shrink: 1;
		min-width: 0;
		padding: 0.25em 0.5em;
		font-size: 1em;
		color: var(--fg);
		background: transparent;
		border: 2px solid var(--fg);
		border-right: 0;
	}

	search input::placeholder {
		color: var(--muted);
		opacity: 1;
	}

	search button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25em;
		font-size: 1.3em;
		color: var(--fg);
		background: transparent;
		border: none;
		border: 2px solid var(--fg);
		border-left: 0;
	}

	.suptitle img {
		height: 1.2em;
	}

	.back {
		display: block;
		font-size: 1rem;
		font-weight: normal;
	}

	aside.toc {
		position: fixed;
		z-index: var(--toc-z-index, 1);
		box-sizing: border-box;
		width: var(--toc-width);
		min-width: var(--toc-min-width);
		height: max-content;
		font-size: var(--toc-font-size);
		overflow-wrap: break-word;
	}

	aside.toc > nav {
		position: relative;
		max-height: var(--toc-max-height, 90vh);
		padding: var(--toc-padding, 1em 1em 0);
		overflow: var(--toc-overflow, auto);
		overscroll-behavior: contain;
	}

	aside.toc > nav > ol {
		padding: var(--toc-ol-padding, 0);
		margin: var(--toc-ol-margin);
		list-style: var(--toc-ol-list-style, none);
	}

	.toc-title {
		padding: var(--toc-title-padding);
		margin: var(--toc-title-margin);
	}

	aside.toc > nav > ol > li {
		padding: 0.5em 1em;
		margin: var(--toc-li-margin);
		color: var(--toc-li-color);
		cursor: pointer;
		border: var(--toc-li-border);
		border-radius: var(--toc-li-border-radius);
	}

	aside.toc > nav > ol > li:hover {
		color: var(--toc-li-hover-color, cornflowerblue);
		background: var(--toc-li-hover-bg);
	}

	aside.toc > nav > ol > li.active {
		font-weight: var(--toc-active-font-weight);
		color: var(--toc-active-color, white);
		background: var(--toc-active-bg, cornflowerblue);
		border: var(--toc-active-border);
		border-width: var(--toc-active-border-width);
		border-radius: var(--toc-active-border-radius, 2pt);
	}

	aside.toc > button {
		position: absolute;
		right: 0;
		bottom: 0;
		z-index: 2;
		padding: var(--toc-mobile-btn-padding, 2pt 3pt);
		font-size: 2em;
		line-height: 0;
		color: var(--toc-mobile-btn-color, black);
		cursor: pointer;
		background: var(--toc-mobile-btn-bg, rgb(255 255 255 / 20%));
		border: none;
		border-radius: var(--toc-mobile-btn-border-radius, 4pt);
	}

	aside.toc > nav > .toc-title {
		margin-top: 0;
	}

	aside.toc.mobile {
		position: fixed;
		right: var(--toc-mobile-right, 1em);
		bottom: var(--toc-mobile-bottom, 1em);
	}

	aside.toc.mobile > nav {
		right: 0;
		z-index: -1;
		box-sizing: border-box;
		width: var(--toc-mobile-width, 18em);
		background: var(--toc-mobile-bg, white);
		border: var(--toc-mobile-border);
		border-radius: 3pt;
		box-shadow: var(--toc-mobile-shadow);
	}

	aside.toc.desktop {
		position: sticky;
		top: 0;
		top: var(--toc-desktop-sticky-top, 2em);
		right: 0;
		max-width: var(--toc-desktop-max-width);
		margin: var(--toc-desktop-nav-margin);

		/* max-width: 200px; */
		background: var(--toc-desktop-bg);
	}
</style>
