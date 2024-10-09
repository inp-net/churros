import { builder } from '#lib';
import { LooseURL, UIDScalar } from '#modules/global';

export const ServiceInput = builder.inputType('ServiceInput', {
  fields: (t) => ({
    name: t.string({ required: false }),
    url: t.field({ required: false, type: LooseURL }),
    description: t.string({ required: false }),
    importance: t.int({ required: false, validate: { min: 0 } }),
    hide: t.boolean({
      required: false,
      description:
        "Masquer le service. Vaut par défaut `true` lorsque l'on crée un nouveau service sans lui donner de nom, sinon `false`.",
    }),
    iconURL: t.field({ required: false, type: LooseURL }),
    removeIcon: t.boolean({ required: false }),
    school: t.field({ required: false, type: UIDScalar }),
    group: t.field({ required: false, type: UIDScalar }),
    studentAssociation: t.field({ required: false, type: UIDScalar }),
    unlinkSchool: t.boolean({ required: false }),
    unlinkGroup: t.boolean({ required: false }),
    unlinkStudentAssociation: t.boolean({ required: false }),
  }),
});
