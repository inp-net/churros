import { z } from 'zod';
import { environmentSchema } from './env.js';

declare global {
  namespace NodeJS {
    export interface ProcessEnv extends Record<keyof z.infer<typeof environmentSchema>, string> {}
  }

  namespace Express {
    interface User {
      user?: SessionUser;
      group?: SessionGroup;
    }
  }
}
