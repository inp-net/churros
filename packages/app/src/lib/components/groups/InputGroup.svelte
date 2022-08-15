<span><slot /></span>

<style lang="scss">
  span {
    // Keep a copy of the original value
    --original-radius-inline: var(--radius-inline);

    display: inline-flex;
    flex-wrap: wrap;

    :global {
      > * {
        // All children have their border-radius set to 0...
        --radius-inline-left: 0;
        --radius-inline-right: 0;
        --radius-inline: var(--radius-inline-left) var(--radius-inline-right)
          var(--radius-inline-right) var(--radius-inline-left);

        + * {
          // Overlap the borders
          margin-left: calc(-1 * var(--border-inline));
        }

        &:focus {
          // Allow the focus ring to stay on top
          z-index: 1;
        }
      }

      // ...except the first and last ones
      > :first-child {
        --radius-inline-left: var(--original-radius-inline);
      }

      > :last-child {
        --radius-inline-right: var(--original-radius-inline);
      }
    }
  }
</style>
