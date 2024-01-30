<!-- From https://github.com/janosh/svelte-toc, MIT-licensed. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { blur, type BlurParams } from 'svelte/transition';
	import MenuIcon from './MenuIcon.svelte';
	import { page } from '$app/stores';

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
	export let autoHide: boolean = true;
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
		font-size: 1.2rem;
		font-weight: bold;
		margin: 0;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		column-gap: 1rem;
		row-gap: 0.5rem;
		flex-wrap: wrap;
	}
	.suptitle img {
		height: 1.2em;
	}
	.back {
		font-size: 1rem;
		font-weight: normal;
		display: block;
	}
	aside.toc {
		box-sizing: border-box;
		height: max-content;
		overflow-wrap: break-word;
		font-size: var(--toc-font-size);
		min-width: var(--toc-min-width);
		width: var(--toc-width);
		z-index: var(--toc-z-index, 1);
		position: fixed;
	}
	aside.toc > nav {
		overflow: var(--toc-overflow, auto);
		overscroll-behavior: contain;
		max-height: var(--toc-max-height, 90vh);
		padding: var(--toc-padding, 1em 1em 0);
	}
	aside.toc > nav > ol {
		list-style: var(--toc-ol-list-style, none);
		padding: var(--toc-ol-padding, 0);
		margin: var(--toc-ol-margin);
	}
	.toc-title {
		padding: var(--toc-title-padding);
		margin: var(--toc-title-margin);
	}
	aside.toc > nav > ol > li {
		cursor: pointer;
		color: var(--toc-li-color);
		border: var(--toc-li-border);
		border-radius: var(--toc-li-border-radius);
		margin: var(--toc-li-margin);
		padding: 0.5em 1em;
	}
	aside.toc > nav > ol > li:hover {
		color: var(--toc-li-hover-color, cornflowerblue);
		background: var(--toc-li-hover-bg);
	}
	aside.toc > nav > ol > li.active {
		background: var(--toc-active-bg, cornflowerblue);
		color: var(--toc-active-color, white);
		font-weight: var(--toc-active-font-weight);
		border: var(--toc-active-border);
		border-width: var(--toc-active-border-width);
		border-radius: var(--toc-active-border-radius, 2pt);
	}
	aside.toc > button {
		border: none;
		bottom: 0;
		cursor: pointer;
		font-size: 2em;
		line-height: 0;
		position: absolute;
		right: 0;
		z-index: 2;
		padding: var(--toc-mobile-btn-padding, 2pt 3pt);
		border-radius: var(--toc-mobile-btn-border-radius, 4pt);
		background: var(--toc-mobile-btn-bg, rgba(255, 255, 255, 0.2));
		color: var(--toc-mobile-btn-color, black);
	}
	aside.toc > nav {
		position: relative;
	}
	aside.toc > nav > .toc-title {
		margin-top: 0;
	}

	aside.toc.mobile {
		position: fixed;
		bottom: var(--toc-mobile-bottom, 1em);
		right: var(--toc-mobile-right, 1em);
	}
	aside.toc.mobile > nav {
		border-radius: 3pt;
		right: 0;
		z-index: -1;
		box-sizing: border-box;
		background: var(--toc-mobile-bg, white);
		width: var(--toc-mobile-width, 18em);
		box-shadow: var(--toc-mobile-shadow);
		border: var(--toc-mobile-border);
	}

	aside.toc.desktop {
		margin: var(--toc-desktop-aside-margin);
	}
	aside.toc.desktop {
		right: 0;
		position: sticky;
		top: 0;
		/* max-width: 200px; */
		background: var(--toc-desktop-bg);
		margin: var(--toc-desktop-nav-margin);
		max-width: var(--toc-desktop-max-width);
		top: var(--toc-desktop-sticky-top, 2em);
	}
</style>
