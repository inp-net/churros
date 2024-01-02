<script lang="ts">
  import IconCheck from '~icons/mdi/check';
  import ButtonGhost from './ButtonGhost.svelte';

  export let steps: ReadonlyArray<readonly [string, string]>;
  export let currentStep: string;

  function stepIndex(id: string) {
    return steps.findIndex(([href, _]) => href === id);
  }

  $: stepIsDone = (id: string) => stepIndex(id) < stepIndex(currentStep);
</script>

<div class="wrapper">
  <div class="progress-steps-line">
    <ul class="progress-steps nobullet">
      {#each steps as [id, label]}
        <li class="progress-step" class:current={id === currentStep} class:done={stepIsDone(id)}>
          <ButtonGhost
            on:click={() => {
              currentStep = id;
            }}
          >
            <div class="button-inner">
              <span class="text">{label}</span>
              <div class="dot">
                {#if stepIsDone(id)}
                  <IconCheck></IconCheck>
                {/if}
              </div>
            </div>
          </ButtonGhost>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .progress-steps {
    display: flex;
    gap: 1rem;
    justify-content: space-around;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    overflow-x: auto;
  }

  .progress-steps-line {
    position: relative;
    display: flex;
  }

  .button-inner {
    position: relative;
    z-index: 5;
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    align-items: center;
    padding: 0.5rem;
  }

  .progress-steps-line::before {
    position: absolute;
    right: 0;
    bottom: calc(0.5rem + 0.25rem + 1.25rem / 2);
    left: 0;
    height: var(--border-block);
    content: '';
    background: var(--primary-bg);
    border-radius: var(--radius-block);
  }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .progress-step .dot {
    position: relative;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--primary-text);
    background: var(--default-bg);
    border: var(--border-block) solid var(--primary-border);
    border-radius: 50%;
    transition: border 0.125s ease;
  }

  .button-inner .text {
    transition: all 0.25s ease;
  }

  .progress-step.done .button-inner {
    font-weight: bold;
    color: color-mix(in srgb, var(--text) 70%, transparent 25%);
  }

  .progress-step.done .dot {
    background: var(--primary-border);
  }

  .progress-step.current .button-inner .text {
    font-weight: bold;
    transform: scale(115%);
  }

  .progress-step.current .dot {
    background: var(--primary-border);
    border: calc(var(--border-block) * 2) solid var(--muted-bg);
    outline: var(--border-block) solid var(--primary-border);
    outline-offset: calc(-1 * var(--border-block));
  }
</style>
