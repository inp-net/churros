import { builder } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { LinkInput } from '#modules/links';
import { EventDraftStep, EventFrequency, Visibility } from '@prisma/client';
import { isBefore } from 'date-fns';
import { EventDraftStepType, EventFrequencyType } from '../index.js';

export const EventInput = builder
  .inputRef<{
    title: string;
    group: string;
    startsAt: Date;
    endsAt: Date;
    description: string;
    coOrganizers: string[];
    contactMail?: string;
    links: Array<typeof LinkInput.$inferInput>;
    lydiaAccountId?: string;
    location: string;
    visibility: Visibility;
    frequency: EventFrequency;
    recurringUntil?: Date;
    bannedUsers: string[];
    showPlacesLeft: boolean;
    draftStep: EventDraftStep;
  }>('EventInput')
  .implement({
    description: "Données à passer pour modifier ou créer un brouillon d'évènement.",
    validate: ({ startsAt, endsAt }) => {
      return isBefore(startsAt, endsAt);
    },
    fields: (t) => ({
      title: t.string({ description: 'Titre', validate: { minLength: 1 } }),
      description: t.string({ description: 'Description', defaultValue: '' }),
      group: t.string({ description: 'UID du groupe organisateur principal' }),
      coOrganizers: t.stringList({
        defaultValue: [],
        description: "Liste d'UIDs de groupes qui participent à l'organisation de l'évènement",
      }),
      startsAt: t.field({ type: DateTimeScalar, description: 'Date de début' }),
      endsAt: t.field({ type: DateTimeScalar, description: 'Date de fin' }),
      contactMail: t.string({
        required: false,
        description:
          "Adresse e-mail pour contacter l'organisation de l'évènement. Par défaut, celle du groupe organisateur",
      }),
      links: t.field({
        type: [LinkInput],
        description: "Liens à afficher sur la page de l'évènement",
        defaultValue: [],
      }),
      lydiaAccountId: t.string({ required: false, description: 'Compte lydia bénéficiaire' }),
      location: t.string({ defaultValue: '', description: "Lieu où se déroule l'évènement" }),
      visibility: t.field({
        defaultValue: Visibility.Private,
        type: VisibilityEnum,
        description: 'Visibilité',
      }),
      frequency: t.field({
        defaultValue: EventFrequency.Once,
        type: EventFrequencyType,
        description: 'Fréquence de répétition',
      }),
      recurringUntil: t.field({
        type: DateTimeScalar,
        required: false,
        description: 'Date de fin de la répétition',
      }),
      bannedUsers: t.stringList({
        defaultValue: [],
        description:
          "Liste d'UIDs de personnes bannies. Ces personnes ne peuvent pas prendre de place pour l'évènement",
      }),
      showPlacesLeft: t.boolean({
        defaultValue: true,
        description:
          "Afficher ou cacher le nombre de places restantes sur l'évènement. Note: c'est une _indication_ seulement, les données sont quand même renvoyées par l'API",
      }),
      draftStep: t.field({
        type: EventDraftStepType,
        defaultValue: EventDraftStep.Infos,
        description: "Étape de création de l'évènement",
      }),
    }),
  });
