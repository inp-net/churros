import { builder } from '#lib';
// import { nextExamDates } from '../index.js';
// @TODO: fix this with new auth system
// maybe delete, and call the associated resolver function in the backend w/o giving access to this. it's kinda pointless

builder.mutationField('updateSubjectsExamDates', (t) =>
  t.boolean({
    async resolve(_, {}, { user }) {
      if (!user) return false;
      // let examDates: Awaited<ReturnType<typeof nextExamDates>>;
      // try {
      //   examDates = await nextExamDates(user);
      // } catch (error) {
      //   await log('ADE', 'error', { error: error?.toString() });
      //   return false;
      // }
      //
      // const syncedSubjects: Record<string, Date> = {};
      //
      // for (const [apogeeCode, examDate] of Object.entries(examDates)) {
      //   const subject = await prisma.subject.updateMany({
      //     where: { apogeeCode },
      //     data: {
      //       nextExamAt: examDate,
      //     },
      //   });
      //   if (subject.count > 0) syncedSubjects[apogeeCode] = examDate;
      // }
      //
      // await log('ADE', 'sync', { syncedSubjects }, undefined, user);

      return true;
    },
  }),
);
