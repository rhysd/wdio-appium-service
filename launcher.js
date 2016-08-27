'use strict';

const spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');

function lowerCamelToOptionName(s) {
    let ret = '--';
    const A = 'A'.charCodeAt(0);
    const Z = 'Z'.charCodeAt(0);
    for (let idx = 0; idx < s.length; ++idx) {
        const c = s.charAt(idx);
        const code = s.charCodeAt(idx);
        if (A <= code && code <= Z) {
            ret += '-' + c.toLowerCase();
        } else {
            ret += c;
        }
    }
    return ret;
}

function keyValueToCliArgs(keyValue) {
    if (Array.isArray(keyValue)) {
        // Note:
        // If specified as array, this plugin assumes it as the string list of command line arguments.
        return keyValue;
    }

    const ret = [];
    for (let key in keyValue) {
        const value = keyValue[key];
        if (typeof value === 'boolean' && !value) {
            continue;
        }

        ret.push(lowerCamelToOptionName(key));

        if (typeof value !== 'boolean') {
            ret.push(value.toString());
        }
    }
    return ret;
}

function detectAppiumCommand(p) {
    while (true) {
        p = path.dirname(p);

        const parsed = path.parse(p);
        if (parsed.root === parsed.dir && parsed.name === '') {
            // When 'p' indicates root directory, local 'appium' command was not found.
            return null;
        }

        if (parsed.name !== 'node_modules') {
            continue;
        }

        const cmd = path.join(p, '.bin', 'appium');
        try {
            if (fs.lstatSync(cmd).isFile()) {
                return cmd;
            }
        } catch(e) {
            // Do nothing
        }
    }
}

class AppiumLauncher {
    onPrepare(config) {
        const c = config.appium || {};

        this.appiumArgs = keyValueToCliArgs(c.args || {});
        this.appiumCommand = c.command || detectAppiumCommand(p) || 'appium';
        this.appiumWaitStartTime = c.waitStartTime || 5000;

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
