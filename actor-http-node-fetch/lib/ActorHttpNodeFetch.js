"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorHttpNodeFetch = void 0;
const bus_http_1 = require("@comunica/bus-http");
require("cross-fetch/polyfill");
/**
 * A node-fetch actor that listens on the 'init' bus.
 *
 * It will call `fetch` with either action.input or action.url.
 */
class ActorHttpNodeFetch extends bus_http_1.ActorHttp {
    constructor(args) {
        super(args);
    }
    async test(action) {
        return { time: Infinity };
    }
    run(action) {
        var _a, _b;
        this.logInfo(action.context, `Requesting ${typeof action.input === 'string' ? action.input : action.input.url}`);
        let url = action.input.url;
        const headers = new Headers(((_a = action.init) === null || _a === void 0 ? void 0 : _a.headers) || {});
        let credentials = getCredentialsFromUrl(url);
        if (credentials) {
            // Credentials were found in the url
            url = getRealUrl(url);
        }
        else {
            // Credentials are now searched in the context
            const authenticatedUrls = (_b = action.context) === null || _b === void 0 ? void 0 : _b.get('authenticatedUrls');
            if (authenticatedUrls) {
                credentials = authenticatedUrls[url];
            }
        }
        // Credentials were passed then add the headers and include credential
        if (credentials) {
            // `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`
            headers.append('Authorization', `Basic ${credentials.username}:${credentials.password}`);
            if (action.init) {
                action.init.headers = headers;
                action.init.credentials = 'include';
            }
            else {
                action.init = { headers, credentials: 'include' };
            }
        }
        const options = {};
        Object.assign(options, action.input);
        options.url = url;
        return fetch(options, action.init);
    }
}
exports.ActorHttpNodeFetch = ActorHttpNodeFetch;
function getCredentialsFromUrl(url) {
    if (!url) {
        return undefined;
    }
    const urlInitialSplit = url.split('@');
    if (urlInitialSplit.length === 2) {
        const credential = urlInitialSplit[0].split('//')[1].split(':');
        return { username: credential[0], password: credential[1] };
    }
    return undefined;
}
function getRealUrl(url) {
    const urlInitialSplit = url.split('@');
    // TODO IF PASSWORD/USERNAME CONTAINS @, ALSO CHECK OTHER FILES SAME CODE
    return `${urlInitialSplit[0].split('//')[0]}//${urlInitialSplit[1]}`;
}
//# sourceMappingURL=ActorHttpNodeFetch.js.map