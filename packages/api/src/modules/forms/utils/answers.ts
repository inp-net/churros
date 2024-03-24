import type { QuestionKind } from '@prisma/client';

export const REDACTED_ANSWER = '•'.repeat(10);

export function castAnswer(
  value: string[],
  createdById: string | null,
  {
    scaleEnd,
    scaleStart,
    type,
    anonymous,
  }: {
    scaleEnd: number | null;
    scaleStart: number | null;
    type: QuestionKind;
    anonymous: boolean;
  },
  user: undefined | { id: string },
): { answer: string[]; number: number | null } {
  if (anonymous && (!user || createdById !== user.id))
    {return {
      answer: [REDACTED_ANSWER],
      number: null,
    };}
  if (value.length === 0) {
    return {
      answer: [],
      number: null,
    };
  }
  return {
    answer: value,
    number: value[0]
      ? type === 'Number'
        ? Number.parseFloat(value[0])
        : type === 'Scale'
          ? Number.parseInt(value[0]) / (scaleEnd! - scaleStart!)
          : null
      : null,
  };
}

export function answerToString(
  {
    answer,
    number,
    question: { scaleEnd, scaleStart, type, anonymous },
    createdById,
  }: {
    answer: string[];
    number: number | null;
    question: {
      type: QuestionKind;
      scaleStart: number | null;
      scaleEnd: number | null;
      anonymous: boolean;
    };
    createdById: string | null;
  },
  user: undefined | { id: string } = undefined,
): string {
  if (anonymous && (!user || createdById !== user.id)) return REDACTED_ANSWER;
  if (answer.length === 0) return '';
  return type === 'Scale'
    ? `${Math.floor(scaleStart! + number! * (scaleEnd! - scaleStart!))}/${scaleEnd!}`
    : number
      ? number.toString()
      : answer.join(',');
}
