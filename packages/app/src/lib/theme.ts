import { onMount } from 'svelte'
import { writable } from 'svelte/store'
import { browser } from '$app/env'

/** Current theme, as a writable store. */
export const theme = writable('light', (set) => {
  // It's not possible to load the theme on the server
  if (!browser) return

  // Try to load the theme from sessionStorage or fallback to a media query
  let currentTheme: string | undefined =
    sessionStorage.getItem('theme') ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  set(currentTheme)

  // Update the page when the theme changes
  onMount(() =>
    theme.subscribe(($theme) => {
      if (currentTheme) document.documentElement.classList.remove(currentTheme)
      sessionStorage.setItem('theme', $theme)
      document.documentElement.classList.add($theme)
      currentTheme = $theme
    })
  )
})
