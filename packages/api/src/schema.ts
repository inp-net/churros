import { builder } from '#lib';
import { printSchema } from 'graphql';
import { defaultKeyGenerator, rateLimitDirective } from 'graphql-rate-limit-directive';
import { writeFile } from 'node:fs/promises';



const { rateLimitDirectiveTransformer } = rateLimitDirective({
  keyGenerator: (dargs, src, args, ctx: Context, info) => {
    return `${ctx.user?.uid}:${defaultKeyGenerator(dargs, src, args, ctx, info)}`;
  },
});

export const schema = rateLimitDirectiveTransformer(builder.toSchema({}));

export const writeSchema = async () =>
  writeFile(new URL('build/schema.graphql', `file:///${process.cwd()}/`), printSchema(schema));
