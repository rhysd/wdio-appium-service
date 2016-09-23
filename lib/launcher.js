'use strict';

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

class AppiumLauncher {
    onPrepare (config) {
        const c = config.appium || {};

        this.appiumArgs = this._keyValueToCliArgs(c.args || {});
        this.appiumCommand = c.command || this._detectAppiumCommand(__dirname) || 'appium';
        this.appiumWaitStartTime = c.waitStartTime || 5000;

        return this._startAppium().then(p => {
            this.process = p;
            return;
        });
    }

    onComplete () {
        if (this.process !== undefined && !this.process.killed) {
            this.process.kill();
        }
    }

    _startAppium () {
        return new Promise((resolve, reject) => {
            const p = spawn(this.appiumCommand, this.appiumArgs, {stdio: ['ignore', 'pipe', 'pipe']});
            const timer = setTimeout(() => {
                p.removeListener('exit', exitCallback);
                if (p.exitCode === null) {
                    return resolve(p);
                }

                return reject(new Error('Appium exited just after starting with exit code:' + p.exitCode));
            }, this.appiumWaitStartTime);

            const exitCallback = code => {
                clearTimeout(timer);
                reject(new Error('Appium exited before timeout (Exit code: ' + code + ')'));
            };

            p.once('exit', exitCallback);
        });
    }

    _detectAppiumCommand (p) {
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
            } catch (e) {
                // Do nothing
            }
        }
    }

    _lowerCamelToOptionName (s) {
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

    _keyValueToCliArgs (args) {
        if (Array.isArray(args)) {
            // Note:
            // If specified as array, this plugin assumes it as the string list of command line arguments.
            return args;
        }

        const ret = [];
        for (let key in args) {
            const value = args[key];
            if (typeof value === 'boolean' && !value) {
                continue;
            }

            ret.push(this._lowerCamelToOptionName(key));

            if (typeof value !== 'boolean') {
                ret.push(value.toString());
            }
        }
        return ret;
    }
}

export default AppiumLauncher;
