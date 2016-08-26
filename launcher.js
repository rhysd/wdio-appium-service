'use strict';

const spawn = require('child_process').spawn;

class AppiumLauncher {
    onPrepare(config) {
        this.appiumArgs = config.appiumArgs || [];
        this.appiumLogs = config.appiumLogs || {};
        this.appiumCommand = config.appiumCommand || 'appium';
        this.appiumWaitStartTime = config.appiumWaitStartTime || 5000;
        this.logToStdout = !!config.logToStdout;

        return this._startAppium().then(p => {
            this.process = p;
            return;
        });
    }

    onComplete() {
        if (!this.process.killed) {
            this.process.kill();
        }
    }

    _startAppium() {
        return new Promise((resolve, reject) => {
            const p = spawn(this.appiumCommand, this.appiumArgs, {stdio: ['ignore', 'pipe', 'pipe']});
            setTimeout(() => {
                if (p.exitCode === null) {
                    resolve(p);
                } else {
                    reject(new Error('Appium exited just after starting with exit code:' + p.exitCode));
                }
            }, this.appiumWaitStartTime);
        });
    }
}

module.exports = new AppiumLauncher();
