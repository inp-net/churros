import { log } from "#modules";

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
