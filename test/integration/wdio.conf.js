'use strict';

const path = require('path');
const APP_PATH = path.join(__dirname, '../node_modules/ios-uicatalog/build/Release-iphonesimulator/UICatalog-iphonesimulator.app');

exports.config = {
    port: 4723,

    // Note:
    // When you want to run a single test file for debug,
    // please use `.only()` method in mocha APIs.
    // Please search below page with '.only' word.
    //
    // https://mochajs.org/
    specs: [
        path.join(__dirname, './*_test.js')
    ],

    // Note:
    // You can run specific suite
    suites: {
    },

    exclude: [
    // 'path/to/excluded/files'
    ],

    // Note:
    // We need to execute E2E test script one by one because only one simplator
    // can exist in one local machine for iOS.
    maxInstances: 1,

    capabilities: [{
        browserName: 'iOS',
        appiumVersion: '1.5.3',
        platformName: 'iOS',
        platformVersion: '8.1',
        deviceName: 'iPhone 6',
        orientation: 'PORTRAIT',
        app: APP_PATH
    }],

    sync: true,

    logLevel: 'verbose',

    coloredLogs: true,

    screenshotPath: './errorShots/',

    baseUrl: 'http://localhost',

    waitforTimeout: 10000,

    connectionRetryTimeout: 90000,

    connectionRetryCount: 3,

    framework: 'mocha',

    mochaOpts: {
        ui: 'bdd',
        fullTrace: true
    },

    services: [
        require('../../launcher')
    ],

    appium: {
        args: {
            address: '127.0.0.1',
            commandTimeout: '7200',
            sessionOverride: true,
            debugLogSpacing: true,
            platformVersion: '10.0',
            platformName: 'iOS',
            showIosLog: true,
            deviceName: 'iPhone 7',
            nativeInstrumentsLib: true,
            isolateSimDevice: true,
            app: APP_PATH
        }
    }
};
