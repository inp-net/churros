import { builder } from '../builder.js';
import { log } from '../objects/logs.js';
import { prisma } from '../prisma.js';

export async function nextExamDates(user: { uid: string }): Promise<Record<string, Date>> {
  const exams = (await fetch(`https://calendrier-n7.inpt.fr/${user.uid}/next-exams`).then(
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

      for (const [apogeeCode, examDate] of Object.entries(examDates)) {
        await log('ADE', 'sync', { [apogeeCode]: examDate }, apogeeCode, user);
        await prisma.subject.updateMany({
          where: { apogeeCode },
          data: {
            nextExamAt: examDate,
          },
        });
      }

      return true;
    },
  }),
);
