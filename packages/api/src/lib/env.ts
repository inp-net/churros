import chalk from 'chalk';
import getByPath from 'lodash.get';
import { z } from 'zod';
import { environmentSchema } from '../env.js';
import { isValidJSON } from './utils.js';
export { environmentSchema } from '../env.js';

/**
 * Returns true if the server is running in development mode.
 */
export function inDevelopment() {
  return process.env['NODE_ENV'] === 'development';
}

let _parsedEnv: z.infer<typeof environmentSchema> | undefined;

export const ENV = new Proxy<NonNullable<typeof _parsedEnv>>({} as NonNullable<typeof _parsedEnv>, {
  get(_target, property: keyof typeof environmentSchema.shape) {
    if (_parsedEnv) return _parsedEnv[property];

    try {
      console.info('Validating environment variables...');
      _parsedEnv = environmentSchema.parse(process.env);
      return _parsedEnv[property];
    } catch (error) {
      if (!(error instanceof z.ZodError)) throw error;

      console.error(chalk.red('Some environment variables are invalid:'));
      formatZodErrors(error);
      throw new Error('Invalid environment variables.');
    }
  },
});

function formatZodErrors(error: z.ZodError<unknown>) {
  for (const { path, message } of error.issues) {
    const variable = path[0]?.toString() as keyof typeof environmentSchema.shape;
    const value = process.env[variable];
    const description = environmentSchema.shape[variable]?.description;

    if (path.length !== 1) {
      console.error(
        formatZodIssue(
          description,
          path.join('.'),
          message,
          path.length === 1 || !isValidJSON(value)
            ? value
            : getByPath(JSON.parse(value), path.slice(1)),
        ),
      );
      continue;
    }

    console.error(formatZodIssue(description, variable, message, value));
  }
}

function formatZodIssue(
  description: string | undefined,
  path: string,
  message: string,
  value: string | undefined,
) {
  return [
    description ? chalk.dim(`\n# ${description}`) : '',
    `${chalk.bold.cyan(path)}: ${message}`,
    `Current value: ${chalk.green(JSON.stringify(value))}`,
  ].join('\n');
}
