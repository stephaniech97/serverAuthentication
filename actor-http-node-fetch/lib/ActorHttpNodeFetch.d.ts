import { ActorHttp, IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import { IActorArgs } from '@comunica/core';
import { IMediatorTypeTime } from '@comunica/mediatortype-time';
import 'cross-fetch/polyfill';
/**
 * A node-fetch actor that listens on the 'init' bus.
 *
 * It will call `fetch` with either action.input or action.url.
 */
export declare class ActorHttpNodeFetch extends ActorHttp {
    constructor(args: IActorArgs<IActionHttp, IMediatorTypeTime, IActorHttpOutput>);
    test(action: IActionHttp): Promise<IMediatorTypeTime>;
    run(action: IActionHttp): Promise<IActorHttpOutput>;
}
