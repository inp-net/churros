/**
 * Update .env to add missing variables, taking their declarations from .env.example
 * Supports multiline values (single-quoted strings)
 */

import dotenv from 'dotenv-parser-serializer';
import fs from 'fs';
import kleur from 'kleur';
import path from 'path';
const { blue, bold, dim, yellow } = kleur;

const here = path.dirname(new URL(import.meta.url).pathname);
const envPath = path.join(here, '../.env');
const examplePath = path.join(here, '../.env.example');

type DotEnv = Record<string, { value: string; description: string | null }>;
const env: DotEnv = dotenv.parse(fs.readFileSync(envPath, 'utf-8'), {
  extractDescriptions: true,
});
const example: DotEnv = dotenv.parse(fs.readFileSync(examplePath, 'utf-8'), {
  extractDescriptions: true,
});

const keysNotInExample = Object.keys(env).filter((key) => !(key in example));
if (keysNotInExample.length > 0) {
  const toAddToExample = Object.fromEntries(
    keysNotInExample.map((key) => {
      let value = '';
      if (key.startsWith('PUBLIC_') || !isSensitive(env[key].value)) {
        value = env[key].value;
      }

      return [
        key,
        {
          value,
          description:
            env[key].description || (value ? null : 'TODO: document this environment variable'),
        },
      ];
    }),
  );
  console.warn(yellow('Local .env file contains keys that are not in the example file:'));
  keysNotInExample.forEach((key) => {
    console.warn(`- ${key}`);
  });

  console.info('Adding the following to .env.example:');
  console.info(quoteblock(dotenv.serialize(toAddToExample).trim()));
  fs.writeFileSync(examplePath, dotenv.serialize({ ...example, ...toAddToExample }));
  console.info(bold('Remember to also update packages/api/src/lib/env.ts, add the following:'));
  console.info(
    Object.entries(toAddToExample)
      .map(([key, { description }]) => `${key}: z.string()/* refine the schema here if relevant */.describe('${description}'),`)
      .join('\n'),
  );
}

const keysOnlyInExample = Object.keys(example).filter((key) => !(key in env));
for (const key of keysOnlyInExample) {
  console.info(`${blue(bold(key))} was added to .env.example, adding this to your .env file:`);
  console.info(quoteblock(dotenv.serialize({ [key]: example[key] }).trim()));
}
const result = { ...example, ...env };

// back up the old .env file
fs.copyFileSync(envPath, `${envPath}.bak`);

fs.writeFileSync(envPath, dotenv.serialize(result));

function isSensitive(value: string): boolean {
  // see https://github.com/mvhenten/string-entropy/blob/HEAD/src/index.ts
  const LOWERCASE_ALPHA = 'abcdefghijklmnopqrstuvwxyz',
    UPPERCASE_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    DIGITS = '0123456789',
    PUNCT1 = '!@#$%^&*()',
    PUNCT2 = '~`-_=+[]{}\\|;:\'",.<>?/';

  // Calculate the size of the alphabet.
  //
  // This is a mostly back-of-the hand calculation of the alphabet.
  // We group the a-z, A-Z and 0-9 together with the leftovers of the keys on an US keyboard.
  // Characters outside ascii add one more to the alphabet. Meaning that the alphabet size of the word:
  // "ümlout" will yield 27 characters. There is no scientific reasoning behind this, besides to
  // err on the save side.
  /**
   * @param {Str} str String to calculate the alphabet from
   * @returns {Number} n Size of the alphabet
   */
  const alphabetSize = (str: string): number => {
    let c: string;
    let size = 0;

    const collect: Record<string, number> = {
      alcaps: 0,
      punct1: 0,
      digits: 0,
      alpha: 0,
      unicode: 0,
      size: 0,
    };

    let seen = '';

    for (var i = 0; i < str.length; i++) {
      c = str[i];

      // we only need to look at each character once
      if (str.indexOf(c) !== i) continue;
      if (LOWERCASE_ALPHA.indexOf(c) !== -1) collect.alpha = LOWERCASE_ALPHA.length;
      else if (UPPERCASE_ALPHA.indexOf(c) !== -1) collect.alcaps = UPPERCASE_ALPHA.length;
      else if (DIGITS.indexOf(c) !== -1) collect.digits = DIGITS.length;
      else if (PUNCT1.indexOf(c) !== -1) collect.punct1 = PUNCT1.length;
      else if (PUNCT2.indexOf(c) !== -1) collect.size = PUNCT2.length;
      // I can only guess the size of a non-western alphabet.
      // The choice here is to grant the size of the western alphabet, together
      // with an additional bonus for the character itself.
      //
      // Someone correct me if I'm wrong here.
      else if (c.charCodeAt(0) > 127) {
        collect.alpha = 26;
        collect.unicode += 1;
      }

      seen += c;
    }

    for (var k in collect) {
      size += collect[k];
    }

    return size;
  };

  // Calculate [information entropy](https://en.wikipedia.org/wiki/Password_strength#Entropy_as_a_measure_of_password_strength)
  /**
   * @param {String} str String to calculate entropy for
   * @returns {Number} entropy
   */
  const entropy = (str: string): number => {
    if (!str) return 0;
    return Math.round(str.length * (Math.log(alphabetSize(str)) / Math.log(2)));
  };

  return entropy(value) > 200;
}

function quoteblock(s: string): string {
  return dim(s.replace(/^/gm, dim(bold('│ '))));
}
