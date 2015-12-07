var electron = require('electron');
var app = electron.app;  // アプリケーション作成用モジュールをロード
var BrowserWindow = require('browser-window'); 
 
//  クラッシュレポート
require('crash-reporter').start();

var mainWindow = null;
 
// 全てのウィンドウが閉じたらアプリケーションを終了します。
app.on('window-all-closed', function () {
  app.quit();
});
 
// アプリケーションの初期化が完了したら呼び出されます。
app.on('ready', function () {
  // メインウィンドウを作成します。
  mainWindow = new BrowserWindow({ width: 1024, height: 638+24 });
 
  // メインウィンドウに表示するURLを指定します。
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
 
  // メインウィンドウが閉じられたときの処理
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  installMenu();
});

/**
 * メニュー一覧
 */
function getMenuList() {

  return [
    {
      label: 'Electron',
      submenu: [
        {
          label: switchCharactersByOS('Quit', '&Quit'),
          accelerator: switchCharactersByOS('Command+Q', 'Ctrl+Q'),
          click: function () { app.quit(); }
        },
      ]
    },

    {
      label: 'File',
      submenu: [
        {
          label: switchCharactersByOS('Save', '&Save'),
          accelerator: switchCharactersByOS('Command+S', 'Ctrl+S'),
          click: function () { mainWindow.webContents.send('save') }
        }

      ]
    },

    {
      label: 'Filter',
      submenu: [
        {
          label: 'ネガポジ反転',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'nega', checked: menuItem.checked });
          }
        },
        {
          label: 'セピア調',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'sepia_tone', checked: menuItem.checked });
          }
        },
        {
          label: 'モザイク',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'mosaic', checked: menuItem.checked });
          }
        },
        {
          label: 'すりガラス',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'diffusion', checked: menuItem.checked });
          }
        },
        {
          label: 'うずまき',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'uzumaki', checked: menuItem.checked });
          }
        },
        {
          label: '2値化(threshold)',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'threshold', checked: menuItem.checked });
          }
        },
        {
          label: '2値化(ランダムディザ)',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'random_dither', checked: menuItem.checked });
          }
        },
        {
          label: '2値化(ベイヤーディザ)',
          type: 'checkbox',
          click: function (menuItem, browserWindow) {
            mainWindow.webContents.send('changeShader', { id: 'bayer_dither', checked: menuItem.checked });
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: switchCharactersByOS('Command+R', 'F5'),
          click: function () { mainWindow.restart(); }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: switchCharactersByOS('Ctrl+Command+F', 'F11'),
          click: function () { mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: switchCharactersByOS('Alt+Command+I', 'Ctrl+I'),
          click: function () { mainWindow.toggleDevTools(); }
        },
      ]
    }
  ];
}

/**
 * メニューの作成
 */
function installMenu() {
  var menuList = getMenuList();
  var Menu = electron.Menu;

  var menu = Menu.buildFromTemplate(menuList);
  Menu.setApplicationMenu(menu);
}

/**
 * WindowsとMacで文字を切り替える
 */
function switchCharactersByOS(forMac, forWin) {
  if (process.platform == 'darwin') {
    return forMac;
  }
  return forWin;
};