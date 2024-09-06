import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';

export async function GET() {
  return json({
    name: dev ? 'Localos' : 'Churros',
    short_name: dev ? 'Localos' : 'Churros',
    start_url: '/',
    lang: 'fr',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'auto',
    description:
      "La plateforme d'organisation de la vie associative! Suit des clubs, prends ta place sur des évènements,  sauve tes partiels, et bien plus encore!",
    categories: ['events'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo-masked.png',
        sizes: '1000x1000',
        type: 'image/png',
        purpose: 'monochrome',
      },
    ],
    theme_color: '#0a5bc5',
    background_color: '#0a5bc5',
    shortcuts: [
      {
        name: 'Évènements',
        short_name: 'Évènements',
        description: 'Voir les évènements à venir',
        url: 'https://churros.inpt.fr/events',
        icons: [
          {
            src: 'https://churros.inpt.fr/icons/planning.png',
            sizes: '192x192',
          },
        ],
      },
    ],
  });
}
