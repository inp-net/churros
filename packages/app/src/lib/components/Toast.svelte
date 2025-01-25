<script lang="ts">
  import { TOAST_LIFETIME_MS, toasts, type Toast } from '$lib/toasts';
  import { fade, slide } from 'svelte/transition';
  import ButtonGhost from './ButtonGhost.svelte';
  import IconClose from '~icons/msl/close';
  import IconCheck from '~icons/msl/check';
  import IconWarning from '~icons/msl/warning-outline';
  import IconError from '~icons/msl/error-outline';
  import IconInfo from '~icons/msl/info-outline';
  import IconDebug from '~icons/msl/bug-report-outline';
  import ButtonInk from './ButtonInk.svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  type ToastData = $$Generic;
  export let toast: Toast<ToastData>;

  $: ({
    id,
    title,
    labels,
    body,
    type,
    showLifetime,
    addedAt = new Date(),
    lifetime = TOAST_LIFETIME_MS,
  } = toast);

  $: timeLeftMs = addedAt.getTime() + lifetime - Date.now();

  onMount(() => {
    void new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        timeLeftMs = addedAt.getTime() + (lifetime ?? TOAST_LIFETIME_MS) - Date.now();
        if (timeLeftMs < 0) {
          clearInterval(interval);
          toasts.remove(id).then(resolve).catch(reject);
          dispatch('close');
        }
      }, 50);
    });
  });

  const theme = {
    info: '',
    warning: 'warning',
    error: 'danger',
    success: 'success',
    debug: 'muted',
  }[type];
</script>

<article
  in:slide={{ axis: 'y', duration: 200 }}
  out:fade={{ duration: 200 }}
  class="toast {theme}"
  id="toast-{id}"
>
  <div class="content">
    <div class="icon">
      {#if type === 'success'}
        <IconCheck></IconCheck>
      {:else if type === 'warning'}
        <IconWarning></IconWarning>
      {:else if type === 'error'}
        <IconError></IconError>
      {:else if type === 'info'}
        <IconInfo></IconInfo>
      {:else if type === 'debug'}
        <IconDebug />
      {/if}
    </div>
    <div class="text">
      {#if title}
        <strong>{title}</strong>
      {/if}
      <p>{body}</p>
    </div>
  </div>
  <div class="rightside">
    {#if labels.action}
      <div class="action">
        <ButtonInk
          on:click={() => {
            dispatch('action');
          }}>{labels.action}</ButtonInk
        >
      </div>
    {/if}
    <div class="close">
      {#if labels.close}
        <ButtonInk on:click={async () => toasts.remove(id)}>
          {labels.close}
        </ButtonInk>
      {:else}
        <ButtonGhost class={theme} on:click={async () => toasts.remove(id)}>
          <IconClose />
        </ButtonGhost>
      {/if}
    </div>
  </div>
  {#if showLifetime}
    <div style:width="{(timeLeftMs / lifetime) * 100}%" class="progress-bar"></div>
  {/if}
</article>

<style>
  .toast {
    position: relative;
    display: flex;
    column-gap: 1rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    overflow: hidden;
    background: var(--bg);
    border-radius: var(--radius-block);
  }

  .text {
    display: flex;
    flex-flow: column wrap;
    gap: 0.25rem;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .action {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .content {
    display: flex;
    column-gap: 1rem;
    align-items: center;
  }

  p,
  strong {
    line-height: 1.1;
  }

  .rightside {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;
  }

  .rightside :global(.button-ink) {
    padding: 0.5rem 0.75rem;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 0.25rem;
    background-color: currentcolor;
    transition: width 50ms linear;
  }
</style>
