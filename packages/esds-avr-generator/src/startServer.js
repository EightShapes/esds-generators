import browserSync from 'browser-sync';
import fs from 'fs-extra';
import path from 'path';

export function startLocalServerSync() {
  const localEnv = browserSync.create();
  const browserSyncConfig = {
    ghostMode: {
      clicks: false, // Syncing clicks causes form elements to be focused after clicking which doesn't happen in normal browser behavior
      forms: true,
      scroll: true,
    },
    open: false,
    notify: false,
    server: {
      baseDir: process.cwd(),
    },
  };

  return new Promise(resolve => {
    // TODO: add a rejection
    localEnv.init(browserSyncConfig, function() {
      resolve(localEnv);
    });
  });
}

export function createAvrRuntimeConfig(localEnv, options) {
  const runtimeConfig = {
    testingPort: localEnv.getOption('port'),
    baseConfig: {},
    hostUrl: options.docker ? 'host.docker.internal' : 'localhost',
  };

  const runtimeConfigPath = path.join(
    process.cwd(),
    'backstop-runtime-config.json',
  );

  fs.writeFileSync(runtimeConfigPath, JSON.stringify(runtimeConfig), 'UTF-8');
}
