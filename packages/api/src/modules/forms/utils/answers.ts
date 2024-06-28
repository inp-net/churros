import type { QuestionKind } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';

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
): { answer: string[] } {
  if (anonymous && (!user || createdById !== user.id)) {
    return {
      answer: [REDACTED_ANSWER],
    };
  }
  if (value.length === 0) {
    return {
      answer: [],
    };
  }
  if (type === 'Scale') {
    const ans = Math.round(Number.parseFloat(value[0]!));
    if (Number.isNaN(ans)) throw new GraphQLError("Réponse invalide: ce n'est pas un nombre");
    if (scaleStart === null || scaleEnd === null)
      throw new GraphQLError('Échelle invalide: les bornes ne sont pas définies');

    scaleEnd ??= Math.max(ans, 10);
    const scaleWidth = scaleEnd - scaleStart;
    return {
      answer: [`${ans - scaleStart}/${scaleWidth}`],
    };
  }

  // Prevent irrelevant answer types from storing more than one value
  if (type === 'SelectMultiple') return { answer: value };

  return {
    answer: [value[0]!],
  };
}

export function answerToString(
  {
    answer,
    question: { scaleEnd, scaleStart, type, anonymous },
    createdById,
  }: {
    answer: string[];
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
  if (type === 'Scale') {
    // The min/max scale may have changed since this answer was stored: we re-normalize the stored value to a [0, 1]-float range and then re-scale it to the current range.
    if (scaleStart === null || scaleEnd === null) return answer[0]!;

    const normalized = normalizeScaleAnswer(answer);
    if (normalized === undefined) return answer[0]!;

    const scaleWidth = scaleEnd! - scaleStart!;
    const value = Math.floor(normalized * scaleWidth + scaleStart);
    if (scaleStart === 0 && scaleEnd === 100) return `${value}%`;

    return `${value}/${scaleEnd}`;
  }
  return answer.join(',');
}

/**
 * Normalizes a scale answer, as stored in the database, to a float between 0 and 1.
 */
export function normalizeScaleAnswer(answer: string[]): undefined | number {
  if (answer.length === 0) return undefined;
  if (!answer[0]!.includes('/')) return undefined;

  const [current, total] = answer[0]!.split('/', 2).map((part) => Number.parseInt(part)) as [
    number,
    number,
  ];

  if (Number.isNaN(current) || Number.isNaN(total)) return undefined;

  return current / total;
}
