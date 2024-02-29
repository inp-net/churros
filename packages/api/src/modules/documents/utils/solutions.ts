import { DocumentType } from '@prisma/client';

export const DOCUMENT_TYPES_WITH_SOLUTIONS: Set<DocumentType> = new Set([
  DocumentType.Exam,
  DocumentType.Exercises,
  DocumentType.GradedExercises,
  DocumentType.Practical,
  DocumentType.PracticalExam,
]);
