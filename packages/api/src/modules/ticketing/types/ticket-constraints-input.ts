import { builder } from '#lib';
import { UIDScalar } from '#modules/global';
import { BooleanConstraint } from './boolean-constraint.js';

export const TicketConstraintsInput = builder.inputType('TicketConstraintsInput', {
  description: "Contraintes d'un billet",
  fields: (t) => ({
    studentAssociationContributors: t.field({
      required: false,
      type: BooleanConstraint,
      description: "Cotisant·e·s de l'AE du groupe organisateur de l'évènement",
    }),
    external: t.field({
      required: false,
      type: BooleanConstraint,
      description:
        "Personnes sans compte Churros ou avec un compte exté (c'est à dire non relié à une école)",
    }),
    alumni: t.field({
      required: false,
      type: BooleanConstraint,
      description: 'Ancien·ne·s étudiant·e·s',
    }),
    apprentices: t.field({
      required: false,
      type: BooleanConstraint,
      description: 'Apprenti·e·s (FISAs)',
    }),
    managersOnly: t.boolean({
      required: false,
      description: "Réservable par les gestionnaires de l'évènement seulement",
    }),
    majors: t.field({
      required: false,
      type: [UIDScalar],
      description: 'Étudiant·e·s de certaines filières',
    }),
    promotions: t.intList({
      required: false,
      description: 'Étudiant·e·s de certaines promos (année)',
    }),
    groupMembers: t.field({
      required: false,
      type: [UIDScalar],
      description: "Membres d'au moins un des groupes spécifiés",
    }),
  }),
});
