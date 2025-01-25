<script lang="ts">
  import { goto } from '$app/navigation';
  import { Capacitor } from '@capacitor/core';
  import { InAppBrowser } from '@capgo/inappbrowser';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  onMount(async () => {
    if (data.fullpageReload || /^https?:\/\//.test(data.next)) window.location.href = data.next;
    else {
      if (Capacitor.isNativePlatform() && data.next.startsWith('https://')) {
        await InAppBrowser.openWebView({
          url: data.next,
        });
      }
      await goto(data.next);
    }
  });
</script>
