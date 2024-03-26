import { z } from 'zod';
import { environmentSchema } from './lib/env.ts.js';

declare namespace NodeJS {
  export interface ProcessEnv extends z.infer<typeof environmentSchema> {}
}
