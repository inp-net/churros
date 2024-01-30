<script lang="ts">
	export let noInteractions = false;
</script>

<span class="pill" class:no-interactions={noInteractions}>
	<slot />
</span>

<style>
	.pill {
		padding: 0.25em 0.75em;
		border: 1px currentcolor solid;
		border-radius: 10000000px;

		/* animation: glow 1s ease infinite alternate; */
	}

	.pill:not(.no-interactions):hover,
	.pill:not(.no-interactions):focus-visible {
		animation: glow 1s ease infinite alternate;
	}

	@keyframes glow {
		0% {
			box-shadow: 0 0 10px 0 var(--bg);
		}

		100% {
			box-shadow: 0 0 30px 3px color-mix(in oklab, white 25%, currentcolor);
		}
	}
</style>
