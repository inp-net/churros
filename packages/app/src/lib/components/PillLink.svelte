<script lang="ts">
  import { fragment, graphql, type PillLink } from '$houdini';
  import { umamiAttributes } from '$lib/analytics';
  import IconLinkVariant from '$lib/components/IconLinkVariant.svelte';
  import IconEmail from '~icons/msl/mail-outline';
  import IconPhone from '~icons/msl/call-outline';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { loading, mapAllLoading, mapLoading, onceLoaded, type MaybeLoading } from '$lib/loading';
  import { socials } from '$lib/social.generated';
  import type { Component } from 'svelte';
  import { tooltip } from '$lib/tooltip';

  function socialSiteFromURL(url: URL) {
    for (const site of Object.values(socials)) {
      // "normalize" by removing prefixing www. and m. from domain names
      const u = new URL(url.href);
      u.hostname = u.hostname.replace(/^(www|m)\./, '');
      if (u.hostname === 'x.com' || u.hostname.endsWith('.x.com'))
        u.hostname = u.hostname.slice(0, -6) + 'twitter.com';

      const match = site.regex.exec(url.href);
      if (match) {
        return {
          username: match[1],
          ...site,
        };
      }
    }
  }

  /** Whether to use social media icons and text (the Link's text is used as a fallback)*/
  export let social = false;

  /** Use a custom icon. Set to null to not display any */
  export let icon: typeof SvelteComponent<any> | undefined | null = undefined;

  /**Show a tooltip*/
  export let help: MaybeLoading<string> = '';

  export let highlighted = false;

  export let track: string | undefined = undefined;

  $: socialSite = social && $data?.url ? mapLoading($data.url, socialSiteFromURL) : undefined;
  $: socialLogo = onceLoaded(socialSite, (s) => s?.icon, undefined);

  export let url: MaybeLoading<URL | string> | undefined = undefined;
  export let text: MaybeLoading<string> | undefined = undefined;

  export let icon: Component | undefined = undefined;

  export let link: PillLink | null = null;
  $: data = fragment(
    link,
    graphql(`
      fragment PillLink on Link @loading {
        url
        rawURL
        text
      }
    `),
  );

  $: protocol = onceLoaded($data?.url, (u) => u?.protocol, '');
</script>

<a
  href={url
    ? onceLoaded(url, (u) => u.toString(), '')
    : onceLoaded($data?.url, (u) => u?.toString() ?? '', '')}
  {...umamiAttributes(track, { url: loading($data?.rawURL, '(not loaded)') })}
  use:tooltip={loading(help, '')}
  class:highlighted
>
  <div class="icon" class:is-logo={Boolean(socialLogo)}>
    {#if icon === null}
      <!-- no icon -->
    {:else if icon || socialLogo}
      <svelte:component this={icon ?? socialLogo}></svelte:component>
    {:else if protocol === 'mailto:'}
      <IconEmail></IconEmail>
    {:else if protocol === 'tel:'}
      <IconPhone></IconPhone>
    {:else}
      <IconLinkVariant></IconLinkVariant>
    {/if}
  </div>
  {#if loading(text, '')}
    <LoadingText value={text} />
  {:else}
    <LoadingText
      value={socialSite || social
        ? mapAllLoading([socialSite, $data?.url], (s, u) => s?.username || u?.hostname)
        : mapAllLoading([$data?.text, $data?.url], (t, u) => t || u?.hostname || u?.pathname)}
      >Chargement…</LoadingText
    >
  {/if}
  <slot />
</a>

<style>
  a {
    display: inline-flex;
    align-items: center;
    padding: 0.25em 0.75em;
    background: var(--bg2);
    border-radius: 1000px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .highlighted {
    background: var(--primary);
    color: var(--bg);
  }

  a:is(:hover, :focus-visible) {
    background: var(--bg3);
  }

  a.highlighted:is(:hover, :focus-visible) {
    background: var(--primary-bg);
    color: var(--primary);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.5ch;
  }

  .icon.is-logo {
    font-size: 0.75em;
  }
</style>
