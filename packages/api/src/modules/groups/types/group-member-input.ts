import { builder } from '#lib';

export const GroupMemberInput = builder.inputType('GroupMemberInput', {
  fields: (t) => ({
    title: t.string({ required: false }),
    president: t.boolean({ required: false }),
    treasurer: t.boolean({ required: false }),
    vicePresident: t.boolean({ required: false }),
    secretary: t.boolean({ required: false }),
    canEditMembers: t.boolean({ required: false }),
    canEditArticles: t.boolean({ required: false }),
    canScanEvents: t.boolean({ required: false }),
  }),
});
