import { browser } from '$app/environment';
import { type ThemeVariable$options } from '$houdini';
import { writable } from 'svelte/store';

export const THEME_CSS_VARIABLE_NAMES: Record<ThemeVariable$options, string> = {
  ColorBackground: 'bg',
  ColorBackground2: 'bg2',
  ColorBackground3: 'bg3',
  ColorBackground4: 'bg4',
  ColorShy: 'shy',
  ColorMuted: 'muted',
  ColorForeground: 'fg',
  ColorPrimary: 'primary',
  ColorSuccess: 'success',
  ColorDanger: 'danger',
  ColorWarning: 'warning',
  ColorPrimaryBackground: 'primary-bg',
  ColorSuccessBackground: 'success-bg',
  ColorDangerBackground: 'danger-bg',
  ColorWarningBackground: 'warning-bg',
  ImageLogoNavbarTop: 'logo-navbar-top',
  ImageLogoNavbarSide: 'logo-navbar-side',
  ImageBackgroundNavbarBottom: 'bg-navbar-bottom',
  ImageBackgroundNavbarTop: 'bg-navbar-top',
  PatternBackground: 'bg-pattern',
};

/** Current theme, as a writable store. */
export const theme = writable<{
  id: string | 'default';
  variant: 'light' | 'dark' | 'auto';
}>(
  {
    id: 'default',
    variant: 'auto',
  },
  (set) => {
    // It's not possible to load the theme on the server
    if (!browser) return;

    // Recover possibly invalid theme variants
    const definedVariants = ['light', 'dark', 'auto'];
    let variant = localStorage.getItem('themeVariant') ?? 'auto';
    if (!definedVariants.includes(variant)) variant = 'auto';

    // Try to load the theme from localStorage
    set({
      // Invalid theme IDs will resolve to the default theme (as the CSS for the default theme just doesn't have the [data-theme=...] selector)
      id: localStorage.getItem('theme') ?? 'default',
      variant: variant as 'light' | 'dark' | 'auto',
    });
  },
);

export const isDark = writable(false);

if (browser) {
  theme.subscribe(($theme) => {
    localStorage.setItem('theme', $theme.id);
    localStorage.setItem('themeVariant', $theme.variant);
    if ($theme.variant === 'auto')
      isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    else isDark.set($theme.variant === 'dark');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
    if ((localStorage.getItem('themeVariant') ?? 'auto') === 'auto') isDark.set(matches);
  });

  isDark.subscribe(($isDark) => {
    document.documentElement.dataset.themeVariant = $isDark ? 'dark' : 'light';
  });
}
