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
    args: [
      "--address", "127.0.0.1",
      "--command-timeout", "7200",
      "--session-override",
      "--debug-log-spacing",
      "--platform-version", "9.1",
      "--platform-name", "iOS",
      "--show-ios-log",
      "--device-name", "iPhone 6",
      "--native-instruments-lib",
      "--isolate-sim-device",
      "--app", APP_PATH
    ]
  }
}
```

This software is distributed under the MIT license.
