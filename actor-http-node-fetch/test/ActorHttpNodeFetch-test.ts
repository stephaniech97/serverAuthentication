import { ActorHttp } from '@comunica/bus-http';
import { Bus, ActionContext } from '@comunica/core';
import { ActorHttpNodeFetch } from '../lib/ActorHttpNodeFetch';
import 'cross-fetch/polyfill';

// Mock fetch
(<any> global).fetch = (input: any, init: any) => {
  if (input.url === 'https://www.google.com/') {
    return Promise.resolve({ status: 200 });
  } if (input.url === 'https://www.google.com/notfound') {
    return Promise.resolve({ status: 404 });
  }
  return Promise.resolve({ status: init?.headers?.get('Authorization') === 'Basic c3RjaGVuOnBhc3N3ZA==' &&
  init.credentials === 'include' ?
    200 :
    403 });
};

describe('ActorHttpNodeFetch', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('The ActorHttpNodeFetch module', () => {
    it('should be a function', () => {
      expect(ActorHttpNodeFetch).toBeInstanceOf(Function);
    });

    it('should be a ActorHttpNodeFetch constructor', () => {
      expect(new (<any> ActorHttpNodeFetch)({ name: 'actor', bus })).toBeInstanceOf(ActorHttpNodeFetch);
      expect(new (<any> ActorHttpNodeFetch)({ name: 'actor', bus })).toBeInstanceOf(ActorHttp);
    });

    it('should not be able to create new ActorHttpNodeFetch objects without \'new\'', () => {
      expect(() => { (<any> ActorHttpNodeFetch)(); }).toThrow();
    });
  });

  describe('An ActorHttpNodeFetch instance', () => {
    let actor: ActorHttpNodeFetch;

    beforeEach(() => {
      actor = new ActorHttpNodeFetch({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ input: <Request> { url: 'https://www.google.com/' }})).resolves
        .toEqual({ time: Infinity });
    });

    it('should run on existing URI with wrong authentication within the URI', () => {
      return expect(actor.run({ input: <Request> { url: 'https://stephanie:wachtwoord@www.notgoogle.com/' }})).resolves
        .toMatchObject({ status: 403 });
    });

    it('should run on existing URI with correct authentication within the URI', () => {
      return expect(actor.run({ input: <Request> { url:
        'https://stchen:passwd@www.notgoogle.com/' }})).resolves.toMatchObject({ status: 200 });
    });

    it('should run on existing URI with given correct authentication urls', () => {
      const currentContext: ActionContext = ActionContext({ authenticatedUrls:
        { 'https://www.notgoogle.com/': { username: 'stchen', password: 'passwd' }}});
      return expect(actor.run({ input: <Request> { url: 'https://www.notgoogle.com/' },
        context: currentContext })).resolves
        .toMatchObject({ status: 200 });
    });

    it('should run on existing URI with given wrong authentication credentials', () => {
      const currentContext: ActionContext = ActionContext({ authenticatedUrls:
        { 'https://www.notgoogle.com/': { username: 'stchenchen', password: 'passwd' }}});
      return expect(actor.run({ input: <Request> { url: 'https://www.notgoogle.com/' },
        context: currentContext })).resolves
        .toMatchObject({ status: 403 });
    });

    it('should run on existing URI with given no authentication credentials', () => {
      const currentContext: ActionContext = ActionContext({ authenticatedUrls: {}});
      return expect(actor.run({ input: <Request> { url: 'https://www.notgoogle.com/' },
        context: currentContext })).resolves
        .toMatchObject({ status: 403 });
    });

    it('should run on non-existing URI with given random authentication credentials', () => {
      const currentContext: ActionContext = ActionContext({ authenticatedUrls:
         { 'https://www.google.com/notfound': { username: 'stchenchen', password: 'passwd' }}});
      return expect(actor.run({ input: <Request> { url: 'https://www.google.com/notfound' },
        context: currentContext })).resolves
        .toMatchObject({ status: 404 });
    });

    it('should run on existing URI with given random authentication credentials without the URI needing any', () => {
      const currentContext: ActionContext = ActionContext({ authenticatedUrls:
        { 'https://www.google.com/': { username: 'stchenchen', password: 'passwd' }}});
      return expect(actor.run({ input: <Request> { url: 'https://www.google.com/' },
        context: currentContext })).resolves
        .toMatchObject({ status: 200 });
    });

    it('should run on an existing URI with the right credentials', () => {
      const currentContext: ActionContext = ActionContext({ authenticatedUrls:
        { 'https://www.google.com/': { username: 'stchen', password: 'passwd' }}});
      return expect(actor.run({ input: <Request> { url: 'https://www.google.com/' },
        context: currentContext })).resolves
        .toMatchObject({ status: 200 });
    });

    it('should run on existing URI with given correct authentication urls with more headers', () => {
      const currentContext: ActionContext = ActionContext({ authenticatedUrls:
        { 'https://www.notgoogle.com/': { username: 'stchen', password: 'passwd' }}});
      return expect(actor.run({ input: <Request> { url: 'https://www.notgoogle.com/' },
        init: { headers: new Headers({ random: 'other' }) },
        context: currentContext })).resolves
        .toMatchObject({ status: 200 });
    });

    it('should run on an existing URI', () => {
      return expect(actor.run({ input: <Request> { url:
        'https://www.google.com/' }})).resolves
        .toMatchObject({ status: 200 });
    });

    it('should run on an non-existing URI', () => {
      return expect(actor.run({ input: <Request> { url: 'https://www.google.com/notfound' }})).resolves
        .toMatchObject({ status: 404 });
    });

    it('should run for an input object and log', async() => {
      const spy = jest.spyOn(actor, <any> 'logInfo');
      await actor.run({ input: 'https://www.google.com/' });
      expect(spy).toHaveBeenCalledWith(undefined, 'Requesting https://www.google.com/');
    });

    it('should run for an input string and log', async() => {
      const spy = jest.spyOn(actor, <any> 'logInfo');
      await actor.run({ input: <Request> { url: 'https://www.google.com/' }});
      expect(spy).toHaveBeenCalledWith(undefined, 'Requesting https://www.google.com/');
    });
  });
});
