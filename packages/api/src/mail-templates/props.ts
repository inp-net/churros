import path from 'node:path';

/**
 * Maps mail template names to an object type that represents the data the mail template takes
 * If the template's name is not here, it means it doesn't take any data.
 */
export type MailProps = {
  'booking': {
    bookingCode: string;
    eventTitle: string;
    bookingLink: string;
    beneficiary: string | null;
  };
  'form-answers': {
    title: string;
    answersDate: string;
    answers: Array<{
      questionTitle: string;
      answerString: string;
    }>;
    linkToAnswers: string;
    formId: string;
  };
  'group-board-updated': {
    groupName: string;
    memberFullName: string;
    rolesText: string;
  };
  'reset-password': {
    resetLink: string;
  };
  'signup-accepted': {
    fullName: string;
  };
  'signup-done': {
    fullName: string;
  };
  'signup-rejected': {
    reason: string;
  };
  'signup-verify-mail': {
    fullName: string;
    url: string;
  };
  'verify-mail': {
    url: string;
  };
  'welcome': {
    url: string;
  };
};

/**
 * Maps template names to CIDs that are required to be included in the mail for the template to work
 */
export type MailRequiredContentIDs = {
  booking: ['qrcode'];
};

// prettier-ignore
export type MailTemplate = /* @generated */ "booking" | "form-answers" | "group-board-updated" | "reset-password" | "signup-accepted" | "signup-done" | "signup-rejected" | "signup-verify-mail" | "verify-mail" | "welcome";

export const mailTemplatesDirectory = path.dirname(new URL(import.meta.url).pathname);

export function isMJMLTemplateFilename(filepath: string): boolean {
  const filename = path.basename(filepath);
  return filename.endsWith('.mjml') && !filename.startsWith('_');
}
