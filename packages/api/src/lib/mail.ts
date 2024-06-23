import Handlebars from 'handlebars';
import { htmlToText } from 'html-to-text';
import mjml2html from 'mjml';
import type { MJMLJsonObject, MJMLParseError } from 'mjml-core';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createTransport } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer/index.js';
import {
  isMJMLTemplateFilename,
  mailTemplatesDirectory,
  type MailProps,
  type MailRequiredContentIDs,
  type MailTemplate,
} from '../mail-templates/props.js';

const compiledTemplates = await precompileTemplates();
const mailer = createTransport(process.env.SMTP_URL || 'smtp://localhost');

/**
 * Maps attachments to their CIDs
 */
type AttachmentsMap<K extends string | number | symbol> = {
  [cid in K]: Omit<Mail.Attachment, 'cid'>;
};

/**
 *
 * @param templateName the template name. See src/mail-templates/
 * @param to Who to send the mail to
 * @param data The data to give. Should be pretty explicit from the type
 * @param options.from The sender of the mail
 * @param options.subjectOverride Override the subject of the mail. By default, the subject is the email's <title>
 * @param options.attachments Attachments to add to the mail. Typing should help you to know what attachments are required
 */
export async function sendMail<Template extends MailTemplate>(
  templateName: Template,
  to: string | string[],
  data: Template extends keyof MailProps ? MailProps[Template] : Record<string, never>,
  {
    from = process.env.PUBLIC_SUPPORT_EMAIL,
    attachments = {},
    subjectOverride = '',
  }: {
    from?: string;
    subjectOverride?: string;
  } & (Template extends keyof MailRequiredContentIDs
    ? {
        attachments: AttachmentsMap<MailRequiredContentIDs[Template][number]> &
          AttachmentsMap<string>;
      }
    : {
        // when no attachments are required, only additional attachments, or no attachments at all
        attachments?: AttachmentsMap<string>;
      }),
) {
  const template = compiledTemplates.get(templateName);
  if (!template) throw new Error(`Template "${template}" not found`);

  const content = template.html({ to, ...data, env: process.env });
  const subject = subjectOverride || template.subject({ to, ...data });

  await mailer.sendMail({
    to,
    from,
    subject,
    html: content,
    text: htmlToText(content),
    attachments: Object.entries(attachments).map(([cid, data]) => ({
      cid,
      ...data,
    })),
  });
}

type PrecompiledTemplate = {
  html: HandlebarsTemplateDelegate<unknown>;
  subject: HandlebarsTemplateDelegate<unknown>;
};

async function precompileTemplates(): Promise<Map<MailTemplate, PrecompiledTemplate>> {
  const compiledTemplates = new Map<MailTemplate, PrecompiledTemplate>();
  const compilationErrors = new Map<string, string[]>();
  for (const templateFilename of await readdir(mailTemplatesDirectory)) {
    if (!isMJMLTemplateFilename(templateFilename)) continue;
    try {
      const result = await compileTemplate(path.join(mailTemplatesDirectory, templateFilename));

      if ('errors' in result) {
        compilationErrors.set(
          templateFilename,
          result.errors.map((e) => e.formattedMessage),
        );
      } else {
        compiledTemplates.set(path.basename(templateFilename, '.mjml') as MailTemplate, result);
      }
    } catch (error) {
      compilationErrors.set(templateFilename, [error?.toString() ?? '']);
    }
  }
  if (compilationErrors.size > 0) {
    console.error(
      'Error compiling templates:\n' +
        [...compilationErrors.entries()]
          .map(([filename, errors]) => `${filename}:\n${errors.join('\n')}`)
          .join('\n'),
    );
  }
  console.info(
    `Successfully compiled ${compiledTemplates.size} mail templates: ${[...compiledTemplates.keys()].join(', ')}`,
  );
  return compiledTemplates;
}

/**
 * Rust FTW
 */
type Result<T, E> = T | { errors: E[] };

async function compileTemplate(
  filepath: string,
): Promise<Result<PrecompiledTemplate, MJMLParseError>> {
  const content = await readFile(filepath, 'utf8');
  if (!content.trim()) {
    console.warn(`${path.basename(filepath)} is an empty MJML template`);
    return {
      html: Handlebars.compile(''),
      subject: Handlebars.compile(''),
    };
  }
  const rendered = mjml2html(content, { filePath: filepath });
  if (rendered.errors.length > 0) return { errors: rendered.errors };

  return {
    html: Handlebars.compile(rendered.html),
    subject: Handlebars.compile(extractMjTitle(rendered.json)),
  };
}

function extractMjTitle(json: MJMLJsonObject): string {
  if ('children' in json) {
    const head = json.children.find((c) => c.tagName === 'mj-head');
    if (head && 'children' in head) {
      const title = head.children.find((c) => c.tagName === 'mj-title');
      if (title && 'content' in title) return title.content;
    }
  }
  throw new Error('No title found in MJML template');
}
