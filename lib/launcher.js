// @flow

'use strict';

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const DEBUG_LOG = 'wdio_appium_service_debug_log.txt';

type AppiumArgsType = {
    [name: string]: string | boolean | null
};

type AppiumServiceConfigType = {
    appium?: { // eslint-disable-line flowtype/delimiter-dangle
        command?: string;
        waitStartTime?: number;
        logFileName?: string;
        args?: AppiumArgsType
    };
};

class AppiumLauncher {
    appiumArgs: Array<string>;
    appiumCommand: string;
    appiumWaitStartTime: number;
    appiumLogFileName: string;
    isDebug: boolean;
    process: child_process$ChildProcess; // eslint-disable-line camelcase

    onPrepare (config: AppiumServiceConfigType): Promise<any> {
        const c = config.appium || {};

        this.appiumArgs = this._keyValueToCliArgs(c.args || {});
        this.appiumCommand = c.command || this._detectAppiumCommand(__dirname) || this._getAppiumFileName();
        this.appiumWaitStartTime = c.waitStartTime || 5000;
        this.appiumLogFileName = c.logFileName || 'appium.log';
        this.isDebug = process.env.NODE_ENV === 'debug';

        if (this.isDebug) {
            fs.writeFileSync(DEBUG_LOG, '');
            this._debugLog(`onPrepare: ${JSON.stringify(config.appium)}`);
        }

        return this._startAppium().then((p: any) => {
            this.process = p;
            if (this.isDebug) {
                this._debugLog('onPrepare: Appium started!');
            }
            return;
        });
    }

    onComplete () {
        if (this.process !== undefined && !this.process.killed) {
            this.process.kill();
        }
    }

    _startAppium (): Promise<child_process$ChildProcess> { // eslint-disable-line camelcase
        return new Promise((resolve: any, reject: any) => {
            if (this.isDebug) {
                this._debugLog(`_startAppium: Will spawn Appium process: ${this.appiumCommand} ${this.appiumArgs.join(' ')}`);
            }
            const p = spawn(this.appiumCommand, this.appiumArgs, {stdio: ['ignore', 'pipe', 'pipe']});
            const log = fs.createWriteStream(this.appiumLogFileName);
            let exited: number | null = null;

            p.stdout.pipe(log);
            p.stderr.pipe(log);

            const timer = setTimeout(() => {  // eslint-disable-line flowtype/require-return-type
                p.removeListener('exit', exitCallback);
                if (exited === null) {
                    if (this.isDebug) {
                        this._debugLog(`_startAppium: Process started:${p.pid}`);
                    }
                    return resolve(p);
                }

                return reject(new Error('Appium exited just after starting with exit code:' + exited));
            }, this.appiumWaitStartTime);

            const exitCallback = (code: number) => {
                clearTimeout(timer);
                exited = code;
                reject(new Error('Appium exited before timeout (Exit code: ' + code + ')'));
            };

            p.once('exit', exitCallback);
        });
    }

    _getAppiumFileName (): string {
        return /^win/.test(process.platform) ? 'appium.cmd' : 'appium';
    }

    _detectAppiumCommand (p: string): ?string {
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

            const cmd = path.join(p, '.bin', this._getAppiumFileName());
            try {
                if (fs.lstatSync(cmd).isFile()) {
                    return cmd;
                }
            } catch (e) {
                // Do nothing
            }
        }
    }

    _lowerCamelToOptionName (s: string): string {
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

    _keyValueToCliArgs (args: AppiumArgsType): Array<string> {
        if (Array.isArray(args)) {
            // Note:
            // If specified as array, this plugin assumes it as the string list of command line arguments.
            return args;
        }

        const ret = [];
        for (let key in args) {
            const value = args[key];
            if ((typeof value === 'boolean' && !value) ||
                 value === null) {
                continue;
            }

            ret.push(this._lowerCamelToOptionName(key));

            if (typeof value !== 'boolean' && value !== null) {
                ret.push(this._sanitizeCliValue(value));
            }
        }
        return ret;
    }
 // eslint-disable-line    no-trailing-spaces 
    _sanitizeCliValue (v: any): string {
        const valueStr = String(v);
        return /\s/.test(valueStr) ? `'${valueStr}'` : valueStr;
    }

    _debugLog (msg: string) {
        fs.appendFile(DEBUG_LOG, `[${new Date(Date.now()).toString()}] ${msg}\n`);
    }
}

export default AppiumLauncher;
