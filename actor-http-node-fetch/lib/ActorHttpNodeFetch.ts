import { ActorHttp, IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import { IActorArgs } from '@comunica/core';
import { IMediatorTypeTime } from '@comunica/mediatortype-time';
import 'cross-fetch/polyfill';

/**
 * A node-fetch actor that listens on the 'init' bus.
 *
 * It will call `fetch` with either action.input or action.url.
 */
export class ActorHttpNodeFetch extends ActorHttp {
  public constructor(args: IActorArgs<IActionHttp, IMediatorTypeTime, IActorHttpOutput>) {
    super(args);
  }

  public async test(action: IActionHttp): Promise<IMediatorTypeTime> {
    return { time: Infinity };
  }

  public run(action: IActionHttp): Promise<IActorHttpOutput> {
    this.logInfo(action.context, `Requesting ${typeof action.input === 'string' ? action.input : action.input.url}`);
    let url = (<Request> action.input).url;
    const headers = new Headers(action.init?.headers || {});
    let credentials = getCredentialsFromUrl(url);

    if (credentials) {
      // Credentials were found in the url
      url = getRealUrl(url);
    } else {
      // Credentials are now searched in the context
      const authenticatedUrls = action.context?.get('authenticatedUrls');
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
      } else {
        action.init = { headers, credentials: 'include' };
      }
    }

    const options: any = {};
    Object.assign(options, action.input);
    options.url = url;
    return fetch(options, action.init);
  }
}

function getCredentialsFromUrl(url: string): {username: string; password: string} |undefined {
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

function getRealUrl(url: string): string {
  const urlInitialSplit = url.split('@');
  // TODO IF PASSWORD/USERNAME CONTAINS @, ALSO CHECK OTHER FILES SAME CODE
  return `${urlInitialSplit[0].split('//')[0]}//${urlInitialSplit[1]}`;
}
