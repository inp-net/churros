import { watch } from 'chokidar';
import { execa } from 'execa';

const watcher = watch('.env', {
  persistent: true,
});

watcher.on('change', () => {
  console.log("Root .env file changed, copying to packages's .env files");
  execa('yarn', ['cp-env'], {
    stdio: 'inherit',
  });
});
