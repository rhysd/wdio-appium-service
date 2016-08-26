Webdriver.io service plugin for Appium
======================================
[![Build Status](https://travis-ci.org/rhysd/wdio-appium-service.svg?branch=master)](https://travis-ci.org/rhysd/wdio-appium-service)

[webdriver.io](http://webdriver.io/) service plugin for [Appium](http://appium.io/).  With this service installed, you need not to run Appium manually.  Please see [the manual for wdio-selenium-standalone-service](http://webdriver.io/guide/services/selenium-standalone.html) for more detail.

## How to Use

Please register this package as service plugin and specify command line arguments in [wdio.conf](http://webdriver.io/guide/getstarted/configuration.html).  `'appium'` is used for command.  If `command` key is provided in the configuration, it will be used.

```javascript
{
  ... // Other config

  service: [
    require('wdio-appium-service')
  ],

  appium: {
    command: path.join(__dirname, '..', 'node_modules', '.bin', 'appium'),
    args: {
      address: '127.0.0.1',
      commandTimeout: '7200',
      sessionOverride: true,
      debugLogSpacing: true,
      platformVersion: '9.1',
      platformName: 'iOS',
      showIosLog: true,
      deviceName: 'iPhone 6',
      nativeInstrumentsLib: true,
      isolateSimDevice: true,
      app: APP_PATH
    }
  }
}
```

For `args`, you can specify keys in lowerCamel.  Its values are interpreted as its value.  If value is boolean, `true` means specifying the key and `false` means not specifying.  For example, `platformVersion: '9.1'` will be converted to `--platform-version=9.1`, `sessionOverride: true` will be `--session-override`, `showIosLog: false` will specify nothing.

This software is distributed under the MIT license.
