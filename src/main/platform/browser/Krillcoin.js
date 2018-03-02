/**
 * Entry class and dynamic loader for the Krillcoin library in Browsers.
 *
 * When using NodeJS, you don't need this class. Just require the `krillcoin` library.
 *
 * @example <caption>Browser usage</caption>
 * <script type="text/javascript" src="https://cdn.krillcoin.com/core/krillcoin.js></script>
 * <script type="text/javascript">
 *     Krillcoin.init(function(core) {
 *         console.log(core.wallet.address);
 *     }, function(errorCode) {
 *         console.log("Error initializing core.");
 *     }, options)
 * </script>
 *
 * @example <caption>Browser usage (experimental)</caption>
 * <script type="text/javascript" src="https://cdn.krillcoin.com/core/krillcoin.js></script>
 * <script type="text/javascript">
 *     async function init() {
 *         await Krillcoin.load();
 *         const core = await new Krillcoin.Core(options);
 *         console.log(core.wallet.address);
 *     }
 *     init();
 * </script>
 *
 * @example <caption>NodeJS usage</caption>
 * const Krillcoin = require('krillcoin');
 * const core = await new Krillcoin.Core(options);
 * console.log(core.wallet.address);
 *
 * @namespace
 */
class Krillcoin {
    /**
     * Load the Krillcoin library.
     * @param {?string} [path] Path that contains the required files to load the library.
     * @returns {Promise} Promise that resolves once the library was loaded.
     */
    static load(path) {
        if (!Krillcoin._hasNativePromise()) return Krillcoin._unsupportedPromise();
        if (Krillcoin._loaded) return Promise.resolve();
        Krillcoin._loadPromise = Krillcoin._loadPromise ||
            new Promise((resolve, error) => {
                if (!Krillcoin._script) {
                    if (!Krillcoin._hasNativeClassSupport() || !Krillcoin._hasProperScoping()) {
                        console.error('Unsupported browser');
                        error(Krillcoin.ERR_UNSUPPORTED);
                        return;
                    } else if (!Krillcoin._hasAsyncAwaitSupport()) {
                        Krillcoin.script = 'web-babel.js';
                        console.warn('Client lacks native support for async');
                    } else {
                        Krillcoin._script = 'web.js';
                    }
                }

                if (!path) {
                    if (Krillcoin._currentScript && Krillcoin._currentScript.src.indexOf('/') !== -1) {
                        path = Krillcoin._currentScript.src.substring(0, Krillcoin._currentScript.src.lastIndexOf('/') + 1);
                    } else {
                        // Fallback
                        path = './';
                    }
                }
                
                Krillcoin._path = path;
                Krillcoin._fullScript = Krillcoin._path + Krillcoin._script;

                Krillcoin._onload = () => {
                    if (!Krillcoin._loaded) {
                        error(Krillcoin.ERR_UNKNOWN);
                    } else {
                        resolve();
                    }
                };
                Krillcoin._loadScript(Krillcoin._fullScript, Krillcoin._onload);
            });
        return Krillcoin._loadPromise;
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
     * Load classes into scope (so you don't need to prefix them with `Krillcoin.`).
     * @param {Array.<string>} classes Array of class names to load in global scope
     * @returns {Promise.<void>}
     */
    static async loadToScope(...classes) {
        await Krillcoin.load();
        for (const clazz of classes) {
            self[clazz] = Krillcoin[clazz];
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
                handler(Krillcoin.ERR_UNSUPPORTED);
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
     * Initialize the Krillcoin client library.
     * @param {function()} ready Function to be called once the library is available.
     * @param {function(errorCode: number)} error Function to be called when the initialization fails.
     */
    static init(ready, error) {
        if (!Krillcoin._hasNativePromise() || !Krillcoin._hasNativeGoodies()) {
            if (error) error(Krillcoin.ERR_UNSUPPORTED);
            return;
        }

        // Wait until there is only a single browser window open for this origin.
        WindowDetector.get().waitForSingleWindow(async function () {
            try {
                await Krillcoin.load();
                await Krillcoin.Crypto.prepareSyncCryptoWorker();
                console.log('Krillcoin engine loaded.');
                if (ready) ready();
            } catch (e) {
                if (Number.isInteger(e)) {
                    if (error) error(e);
                } else {
                    console.error('Error while initializing the core', e);
                    if (error) error(Krillcoin.ERR_UNKNOWN);
                }
            }
        }, () => error && error(Krillcoin.ERR_WAIT));
    }
}
Krillcoin._currentScript = document.currentScript;
if (!Krillcoin._currentScript) {
    // Heuristic
    const scripts = document.getElementsByTagName('script');
    Krillcoin._currentScript = scripts[scripts.length - 1];
}

Krillcoin.ERR_WAIT = -1;
Krillcoin.ERR_UNSUPPORTED = -2;
Krillcoin.ERR_UNKNOWN = -3;
Krillcoin._script = null;
Krillcoin._path = null;
Krillcoin._fullScript = null;
Krillcoin._onload = null;
Krillcoin._loaded = false;
Krillcoin._loadPromise = null;
