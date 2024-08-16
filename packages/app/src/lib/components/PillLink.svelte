<script lang="ts">
  import { fragment, graphql, type PillLink } from '$houdini';
  import { umamiAttributes } from '$lib/analytics';
  import IconLinkVariant from '$lib/components/IconLinkVariant.svelte';
  import IconEmail from '~icons/msl/mail-outline';
  import IconPhone from '~icons/msl/call-outline';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { loading, mapAllLoading, mapLoading, onceLoaded } from '$lib/loading';
  import { socials } from '$lib/social.generated';

  function socialSiteFromURL(url: URL) {
    for (const site of Object.values(socials)) {
      const match = site.regex.exec(url.href);
      if (match) {
        return {
          username: match.groups?.username,
          ...site,
        };
      }
    }
  }

  /** Whether to use social media icons and text (the Link's text is used as a fallback)*/
  export let social = false;

  export let track: string | undefined = undefined;

  $: socialSite = social && $data?.url ? mapLoading($data.url, socialSiteFromURL) : undefined;
  $: socialLogo = onceLoaded(socialSite, (s) => s?.icon, undefined);

  export let link: PillLink | null;
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
  href={onceLoaded($data?.url, (u) => u?.toString() ?? '', '')}
  {...umamiAttributes(track, { url: loading($data?.rawURL, '(not loaded)') })}
>
  <div class="icon" class:is-logo={Boolean(socialLogo)}>
    {#if socialLogo}
      <svelte:component this={socialLogo}></svelte:component>
    {:else if protocol === 'mailto:'}
      <IconEmail></IconEmail>
    {:else if protocol === 'tel:'}
      <IconPhone></IconPhone>
    {:else}
      <IconLinkVariant></IconLinkVariant>
    {/if}
  </div>
  <LoadingText
    value={socialSite
      ? mapAllLoading([socialSite, $data?.url], (s, u) => s?.username || u?.hostname)
      : mapAllLoading([$data?.text, $data?.url], (t, u) => t || u?.hostname || u?.pathname)}
    >Chargement…</LoadingText
  >
</a>

<style>
  a {
    display: inline-flex;
    align-items: center;
    padding: 0.25em 0.75em;
    background: var(--bg2);
    border-radius: 1000px;
  }

  a:hover {
    background-color: var(--bg3);
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.5ch;
  }

  /* .icon.is-logo {
    font-size: 0.8em;
  } */
</style>
