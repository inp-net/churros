<script lang="ts">
  import { fragment, graphql, type AnalyticsTrackerUser } from '$houdini';
  import { CURRENT_VERSION, CURRENT_COMMIT } from '$lib/buildinfo';
  import { isPWA } from '$lib/pwa';
  import { Capacitor } from '@capacitor/core';
  import { theme, isDark } from '$lib/theme';

  export let user: AnalyticsTrackerUser | null;
  $: data = fragment(
    user,
    graphql(`
      fragment AnalyticsTrackerUser on User {
        major {
          shortName
        }
        yearTier
      }
    `),
  );
</script>

<svelte:head>
  <script
    async
    src="https://stats.inpt.fr/script.js"
    data-website-id="e3bd5b08-b0a3-47ff-a274-1df9ba831c3e"
    data-domains="churros.inpt.fr"
    data-loggedin={$data ? 'true' : 'false'}
    data-theme={$theme}
    data-darkmode={$isDark ? 'true' : 'false'}
    data-version={CURRENT_VERSION}
    data-commit={CURRENT_COMMIT}
    data-user-major={$data?.major?.shortName ?? '(none)'}
    data-user-year-tier={$data?.yearTier ? `${$data.yearTier}A` : '(none)'}
    data-context={Capacitor.isNativePlatform()
      ? Capacitor.getPlatform()
      : isPWA()
        ? 'pwa'
        : 'browser'}
  ></script>
</svelte:head>
