import { watch } from 'chokidar';
import { execa } from 'execa';

const watcher = watch('src/modules/', {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('add', (path) => {
  if (path.endsWith('index.ts')) return;
  console.log(`New file ${path}: barrelizing`);
  execa('yarn', ['barrelize'], {
    stdio: 'inherit',
  });
});
watcher.on('unlink', (path) => {
  if (path.endsWith('index.ts')) return;
  console.log(`File ${path} removed: barrelizing`);
  execa('yarn', ['barrelize'], {
    stdio: 'inherit',
  });
});
