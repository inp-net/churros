import { watch } from 'chokidar';
import { execa } from 'execa';

const watcher = watch('src/mail-templates/', {
  persistent: true,
  ignoreInitial: true,
  ignored: 'src/mail-templates/props.ts',
});

function buildMailTemplates(path: string) {
  console.log(path, 'Mail templates changed, re-building mail templates type file');
  execa('yarn', ['tsx', 'scripts/update-mail-templates-type.ts'], {
    stdio: 'inherit',
  });
}

watcher.on('add', buildMailTemplates);
watcher.on('change', buildMailTemplates);
watcher.on('unlink', buildMailTemplates);
