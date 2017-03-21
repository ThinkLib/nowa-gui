const { spawn, exec, execFile, fork } = require('child_process');
const { join } = require('path');
const npmRunPath = require('npm-run-path');
const fs = require('fs-extra');
const uuid = require('uuid');
// const log = require('electron-log');
const fixPath = require('fix-path');

fixPath();
const { APP_PATH, NOWA_PATH, NOWA_BIN_PATH, IS_WIN, NODE_PATH, NPM_PATH } = require('../constants');

const systemSep = IS_WIN ? ';' : ':';

const npmEnv = npmRunPath.env();
const pathEnv = [npmEnv.PATH, NOWA_BIN_PATH, NODE_PATH, NPM_PATH].filter(p => !!p).join(systemSep);
const env = Object.assign(npmEnv, {
  FORCE_COLOR: 1,
  PATH: pathEnv
});

// fs.writeJsonSync(join(APP_PATH, 'env.text'), process.env)
module.exports = {

  build(projectPath) {
    // return spawn(NODE_PATH, [NOWA_PATH, 'build'], {
    return spawn(NODE_PATH, [NPM_PATH, 'run', 'build', '--scripts-prepend-node-path=auto'], {
      cwd: projectPath,
      env,
    });
  },

  buildNowa(projectPath) {
    // return execFile(NPM_PATH, ['run', 'build'], {
    // return spawn(NODE_PATH, [NOWA_PATH, 'build'], {
    return spawn(NODE_PATH, [NPM_PATH, 'run', 'build', '--scripts-prepend-node-path=auto'], {
      cwd: projectPath,
      env,
    });
  },

  link(projectPath){
    const bins = fs.readdirSync('/usr/local/bin');
    bins.forEach(item => {
      spawn(NODE_PATH, [NPM_PATH, 'link', item], {
        cwd: projectPath,
        env,
      });
    });
  },

  start(projectPath) {
    /*return spawn(NODE_PATH, [NPM_PATH, 'root', '-g'], {
       cwd: projectPath,
        env,
    });*/

    // return spawn(NODE_PATH, [NPM_PATH, 'start', '--scripts-prepend-node-path=auto'], {
    const term = spawn(NODE_PATH, [NOWA_PATH, 'server'], {
    // const term = execFile(NPM_PATH, ['start'], {
      cwd: projectPath,
      env,
      detached: true
    });

    // global[uuid.v4()] = {
    //   pid: term.pid,
    //   term,
    //   logs: '',
    // };

    return term;
  },

  

  openEditor(projectPath, editor, basePath) {
    let editorPath = '';

    if (editor === 'Sublime') {
      editorPath = join(basePath, IS_WIN ? 'subl.exe' : '/Contents/SharedSupport/bin/subl');
    }

    if (editor === 'VScode') {
      editorPath = join(basePath, IS_WIN ? 'bin/code.cmd' : '/Contents/Resources/app/bin/code');
    }

    return spawn(editorPath,
      ['./'], {
        cwd: projectPath,
      });
  },

  nodeInstall(options) {
    const targetPath = join(APP_PATH, 'task', 'install.js');
    // return execFile(targetPath, {
    const term = fork(targetPath, {
      cwd: APP_PATH,
      silent: true,
      // execArgv: ['--harmony'],
      env: Object.assign(env, { params: JSON.stringify(options) }),
    });
    return term;
    /*const targetPath = join(APP_PATH, 'task', 'install.js');
    return spawn(NODE_PATH, [targetPath], {
      cwd: APP_PATH,
      execArgv: ['--harmony'],
      env: Object.assign(env, { params: JSON.stringify(options) }),
    });*/
  },

  /*installTemplate(name) {
    return spawnSync(NODE_PATH, [NPM, 'install', name,
      '--prefix', TEMPLATES_DIR,
      '--registry=https://registry.npm.taobao.org',
      '-S',
      '--scripts-prepend-node-path=auto'], {
        cwd: APP_PATH,
        shell: true,
        env: Object.assign({ FORCE_COLOR: 1 }, npmRunPath.env()),
      });
  }*/
};
