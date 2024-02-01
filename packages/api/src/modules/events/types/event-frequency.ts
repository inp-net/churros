import { builder } from '#lib';

import { EventFrequency } from '@prisma/client';

export const EventFrequencyType = builder.enumType(EventFrequency, {
  description:
    "Fréquence de répétition d'un évènement récurrent. Utile par exemple pour les activités de clubs",
  name: 'EventFrequency',
  values: {
    Biweekly: { description: 'Toutes les deux semaines' },
    Monthly: { description: 'Chaque mois' },
    Once: { description: "Pas de récurrence, l'évènement n'a lieu qu'une fois." },
    Weekly: { description: 'Chaque semaine' },
  },
});
