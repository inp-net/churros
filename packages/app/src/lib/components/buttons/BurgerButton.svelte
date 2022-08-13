<script lang="ts">
  // elasticIn and Out are fun too
  import { quadIn, quadOut } from 'svelte/easing';

  export let openness: number;

  // Clamp openness between 0 and 1
  $: t = Math.min(Math.max(0, openness), 1);

  /** @see https://svelte.dev/examples/easing */
  let ease = quadIn;
  $: if (t === 0) ease = quadIn;
  else if (t === 1) ease = quadOut;

  /** @see https://en.wikipedia.org/wiki/Linear_interpolation */
  const interpolate = (t: number, a: number, b: number) => (1 - t) * a + t * b;

  /** Interpolation between n points. */
  const npolate = (t: number, ...points: number[]) => {
    let prev = points.shift()!;
    const { length } = points;
    if (length === 0) throw new TypeError('You must give at least two points to npolate');

    t = ease(t);

    // Before 0 interpolation
    if (t < 0) return interpolate(t / length, prev, points[0]);

    for (const [i, point] of points.entries()) {
      if (t <= (i + 1) / length) return interpolate(length * t - i, prev, point);
      prev = point;
    }

    // Past 1 interpolation
    return interpolate((t - 1) / length + 1, points.at(-2)!, prev);
  };

  $: title = openness >= 0.5 ? 'Bouton de fermeture du menu' : "Bouton d'ouverture du menu";
</script>

<button on:click {title} style:animation-delay="-{t}s">
  <svg viewBox="0 0 24 24" width="96" height="96">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
      d="M{npolate(t, 6, 7, 7)} {npolate(t, 8, 7, 7)}
         L{npolate(t, 18, 17, 17)} {npolate(t, 8, 17, 17)}"
    />
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
      d="M{npolate(t, 6, 7, 7)} {npolate(t, 12, 7, 7)}
         L{npolate(t, 18, 17, 17)} {npolate(t, 12, 17, 17)}"
    />
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
      d="M{npolate(t, 6, 7, 7)} {npolate(t, 16, 7, 7)}
         L{npolate(t, 18, 17, 17)} {npolate(t, 16, 17, 17)}"
      transform="rotate({npolate(t, 0, 0, 90)},12,12)"
    />
  </svg>
</button>

<style lang="scss">
  button {
    all: unset;
    padding: 0.25rem;
    border-radius: var(--radius-inline);
    outline: 0 solid var(--ring);
    animation: 1s paused color;

    &:active {
      box-shadow: none;
    }

    &:focus-visible {
      outline: 4px solid var(--ring);
    }

    > :global(svg) {
      width: 3rem;
      height: 3rem;
    }
  }

  // These keyframes are used to interpolate the color
  @keyframes color {
    from {
      color: var(--primary-text);
    }
  }
</style>
