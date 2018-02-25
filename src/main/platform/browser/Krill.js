/**
 * Entry class and dynamic loader for the Krill library in Browsers.
 *
 * When using NodeJS, you don't need this class. Just require the `krill` library.
 *
 * @example <caption>Browser usage</caption>
 * <script type="text/javascript" src="https://cdn.krillcoin.com/core/krill.js></script>
 * <script type="text/javascript">
 *     Krill.init(function(core) {
 *         console.log(core.wallet.address);
 *     }, function(errorCode) {
 *         console.log("Error initializing core.");
 *     }, options)
 * </script>
 *
 * @example <caption>Browser usage (experimental)</caption>
 * <script type="text/javascript" src="https://cdn.krillcoin.com/core/krill.js></script>
 * <script type="text/javascript">
 *     async function init() {
 *         await Krill.load();
 *         const core = await new Krill.Core(options);
 *         console.log(core.wallet.address);
 *     }
 *     init();
 * </script>
 *
 * @example <caption>NodeJS usage</caption>
 * const Krill = require('krill');
 * const core = await new Krill.Core(options);
 * console.log(core.wallet.address);
 *
 * @namespace
 */
class Krill {
    /**
     * Load the Krill library.
     * @param {?string} [path] Path that contains the required files to load the library.
     * @returns {Promise} Promise that resolves once the library was loaded.
     */
    static load(path) {
        if (!Krill._hasNativePromise()) return Krill._unsupportedPromise();
        if (Krill._loaded) return Promise.resolve();
        Krill._loadPromise = Krill._loadPromise ||
            new Promise((resolve, error) => {
                if (!Krill._script) {
                    if (!Krill._hasNativeClassSupport() || !Krill._hasProperScoping()) {
                        console.error('Unsupported browser');
                        error(Krill.ERR_UNSUPPORTED);
                        return;
                    } else if (!Krill._hasAsyncAwaitSupport()) {
                        Krill.script = 'web-babel.js';
                        console.warn('Client lacks native support for async');
                    } else {
                        Krill._script = 'web.js';
                    }
                }

                if (!path) {
                    if (Krill._currentScript && Krill._currentScript.src.indexOf('/') !== -1) {
                        path = Krill._currentScript.src.substring(0, Krill._currentScript.src.lastIndexOf('/') + 1);
                    } else {
                        // Fallback
                        path = './';
                    }
                }
                
                Krill._path = path;
                Krill._fullScript = Krill._path + Krill._script;

                Krill._onload = () => {
                    if (!Krill._loaded) {
                        error(Krill.ERR_UNKNOWN);
                    } else {
                        resolve();
                    }
                };
                Krill._loadScript(Krill._fullScript, Krill._onload);
            });
        return Krill._loadPromise;
    }

    static _loadScript(url, resolve) {
        // Adding the script tag to the head as suggested before
        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        // These events might occur before processing, so delay them a bit.
        const ret = () => window.setTimeout(resolve, 1000);
        script.onreadystatechange = ret;
        script.onload = ret;

        // Fire the loading
        head.appendChild(script);
    }

    /**
     * Load classes into scope (so you don't need to prefix them with `Krill.`).
     * @param {Array.<string>} classes Array of class names to load in global scope
     * @returns {Promise.<void>}
     */
    static async loadToScope(...classes) {
        await Krill.load();
        for (const clazz of classes) {
            self[clazz] = Krill[clazz];
        }
    } 

    static _hasNativeClassSupport() {
        try {
            eval('"use strict"; class A{}'); // eslint-disable-line no-eval
            return true;
        } catch (err) {
            return false;
        }
    }

    static _hasAsyncAwaitSupport() {
        try {
            eval('"use strict"; (async function() { await {}; })()'); // eslint-disable-line no-eval
            return true;
        } catch (err) {
            return false;
        }
    }

    static _hasProperScoping() {
        try {
            eval('"use strict"; class a{ a() { const a = 0; } }'); // eslint-disable-line no-eval
            return true;
        } catch (err) {
            return false;
        }
    }

    static _hasNativePromise() {
        return window.Promise;
    }

    static _unsupportedPromise() {
        return {
            'catch': function (handler) {
                handler(Krill.ERR_UNSUPPORTED);
                return this;
            },
            'then': function () {
                return this;
            }
        };
    }

    static _hasNativeGoodies() {
        return window.Number && window.Number.isInteger;
    }

    /**
     * Initialize the Krill client library.
     * @param {function()} ready Function to be called once the library is available.
     * @param {function(errorCode: number)} error Function to be called when the initialization fails.
     */
    static init(ready, error) {
        if (!Krill._hasNativePromise() || !Krill._hasNativeGoodies()) {
            if (error) error(Krill.ERR_UNSUPPORTED);
            return;
        }

        // Wait until there is only a single browser window open for this origin.
        WindowDetector.get().waitForSingleWindow(async function () {
            try {
                await Krill.load();
                await Krill.Crypto.prepareSyncCryptoWorker();
                console.log('Krill engine loaded.');
                if (ready) ready();
            } catch (e) {
                if (Number.isInteger(e)) {
                    if (error) error(e);
                } else {
                    console.error('Error while initializing the core', e);
                    if (error) error(Krill.ERR_UNKNOWN);
                }
            }
        }, () => error && error(Krill.ERR_WAIT));
    }
}
Krill._currentScript = document.currentScript;
if (!Krill._currentScript) {
    // Heuristic
    const scripts = document.getElementsByTagName('script');
    Krill._currentScript = scripts[scripts.length - 1];
}

Krill.ERR_WAIT = -1;
Krill.ERR_UNSUPPORTED = -2;
Krill.ERR_UNKNOWN = -3;
Krill._script = null;
Krill._path = null;
Krill._fullScript = null;
Krill._onload = null;
Krill._loaded = false;
Krill._loadPromise = null;
