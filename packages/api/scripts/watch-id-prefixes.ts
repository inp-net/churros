import { watch } from 'chokidar';
import { execa } from 'execa';

watch('../db/prisma/schema.prisma', {
  persistent: true,
}).on('change', (path) => {
  console.log(`Prisma schema (at ${path}) changed, re-generating ID prefix to typenames map`);
  execa('yarn', ['build:typenames'], {
    stdio: 'inherit',
  });
});
