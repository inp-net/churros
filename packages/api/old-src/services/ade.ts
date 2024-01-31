import { builder, prisma } from '../lib/index.js';
import { log } from '../objects/logs.js';

export async function nextExamDates(user: {
  schoolUid: string | null;
}): Promise<Record<string, Date>> {
  if (!user.schoolUid) return {};
  const exams = (await fetch(`https://calendrier-n7.inpt.fr/${user.schoolUid}/next-exams`).then(
    async (response) => {
      if (response.status !== 200) {
        await log('ADE', 'error', { error: await response.text() });
        return {};
      }

      return response.json();
    },
  )) as Record<string, { starts_at: string }>;

  return Object.fromEntries(
    Object.entries(exams).map(([code, exam]) => [code, new Date(exam.starts_at)]),
  );
}

builder.mutationField('updateSubjectsExamDates', (t) =>
  t.boolean({
    async resolve(_, {}, { user }) {
      if (!user) return false;
      let examDates: Awaited<ReturnType<typeof nextExamDates>>;
      try {
        examDates = await nextExamDates(user);
      } catch (error) {
        await log('ADE', 'error', { error: error?.toString() });
        return false;
      }

      const syncedSubjects: Record<string, Date> = {};

      for (const [apogeeCode, examDate] of Object.entries(examDates)) {
        const subject = await prisma.subject.updateMany({
          where: { apogeeCode },
          data: {
            nextExamAt: examDate,
          },
        });
        if (subject.count > 0) syncedSubjects[apogeeCode] = examDate;
      }

      await log('ADE', 'sync', { syncedSubjects }, undefined, user);

      return true;
    },
  }),
);
