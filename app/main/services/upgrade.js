const cp = require('child_process');
const semver = require('semver');
const { join } = require('path');
const { dialog, BrowserWindow } = require('electron');
const request = require('./request');
const { getPackgeJson } = require('./application');
const { APP_PATH } = require('../constants');
const { getWin } = require('./window');

let newRealse = null;


const downloadNewRelease = (url) => {
  try {
    if (process.platform === 'win32') {
      console.log('[INFO] windows download start');
      cp.exec(`explorer "${url}"`);
    } else {
      console.log('[INFO]mac osx download start');
      cp.exec(`open "${url}"`);
    }
  } catch (err) {
    const win = getWin();
    win.webContents.send('MAIN_ERR', err.message);
  }
};

const getLatest = (visible, window, newVersion) => {
  const parentWindow = window || BrowserWindow.getFocusedWindow();

  if (newRealse) {
    dialog.showMessageBox(parentWindow, {
      type: 'info',
      title: 'Update NowaGUI',
      message: 'New Release!',
      detail: `Version ${newVersion}`,
      icon: join(APP_PATH, 'assets', 'nowa256.png'),
      buttons: [
        'Update Now',
        'Update Later',
      ],
    }, (res) => {
      if (res === 0) {
        downloadNewRelease(newRealse);
      }
    });
  } else {
    if (!visible) return;
    dialog.showMessageBox(parentWindow, {
      type: 'info',
      title: 'Update NowaGUI',
      message: 'No New Release.',
      detail: `Current Version ${newVersion}`,
      icon: join(APP_PATH, 'assets', 'nowa256.png'),
      buttons: [
        'Close',
      ],
    });
  }
};


const checkLatest = (visible = true, window = null) => {
  request('https://registry.npm.taobao.org/nowa-gui-version/latest')
    .then(({ data }) => {
      const newVersion = data.version;
      if (semver.lt(getPackgeJson().version, newVersion)) {
        if (process.platform === 'win32') {
          newRealse = 'http://t.cn/RJQv8uj';
        } else {
          newRealse = 'http://t.cn/RJQPL3J';
        }

        // todo linux version
      }

      getLatest(visible, window, newVersion);
    }).catch((err) => {
      const win = getWin();
      win.webContents.send('MAIN_ERR', err.message);
    });
};

module.exports = {
  downloadNewRelease,
  getLatest,
  checkLatest,
};
