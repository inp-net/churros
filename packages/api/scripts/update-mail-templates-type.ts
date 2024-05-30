import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { isMJMLTemplateFilename, mailTemplatesDirectory } from '../src/mail-templates/props.js';

function getMailTemplates(): string[] {
  return readdirSync(mailTemplatesDirectory)
    .filter(isMJMLTemplateFilename)
    .map((file) => path.basename(file, '.mjml'));
}

const targetFilepath = path.join(mailTemplatesDirectory, 'props.ts');

const content = readFileSync(targetFilepath, 'utf8')
  .split('\n')
  .map((line) =>
    line.startsWith('export type MailTemplate = ')
      ? `export type MailTemplate = /* @generated */ ${getMailTemplates()
          .map((file) => `"${file}"`)
          .join(' | ')};`
      : line,
  );

writeFileSync(targetFilepath, content.join('\n'));
