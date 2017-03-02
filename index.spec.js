const expect = require('chai').expect;
const injector = require('injectdeps');
const loadConfig = require('./index');
const config = require('config');

const defaultDatabase = injector(['app.db.host', 'app.db.port', 'app.db.debug'], function(host, port, debug){
  return `${host}:${port}:${debug}`;
});

const differentRootDatabase = injector(['db.host', 'db.port'], function(host, port){
  return `${host}:${port}`;
});

const prefixedDatabase = injector(['cfg.db.host', 'cfg.db.port'], function(host, port){
  return `${host}:${port}`;
});

const arrayTestDatabase = injector(['cfg.db.seeds', 'cfg.db.port'], function(seeds, port){
  return seeds.map(s=>s+':'+port).join(',');;
});

const objectTestDatabase = injector(['app.db'], function(cfg){
  return JSON.stringify(cfg);
});

describe('injectdeps-config', () => {
  it("should load properties with the default settings", () => {
    const container = injector.getContainer();
    const configLoader = loadConfig(config, {});
    const db = configLoader(container)
      .bindName('db').toObject(defaultDatabase)
      .newObject('db');
    expect(db).to.equal("localhost:1234:true");
  });

  it("should load properties with a different root", () => {
    const settings = {
      root: 'app'
    };
    const db = loadConfig(config, settings)()
      .bindName('db').toObject(differentRootDatabase)
      .newObject('db');
    expect(db).to.equal("localhost:1234");
  });

  it("should load properties with a custom prefix binding", () => {
    const settings = {
      root: 'app',
      prefix: 'cfg'
    };
    const db = loadConfig(config, settings)()
      .bindName('db').toObject(prefixedDatabase)
      .newObject('db');
    expect(db).to.equal("localhost:1234");
  });

  it("should load arrays", () => {
    const settings = {
      root: 'app',
      prefix: 'cfg',
      log: true,
      typeHints: {
        'cfg.db.seeds': 'string'
      }
    };
    const db = loadConfig(config, settings)()
      .bindName('db').toObject(arrayTestDatabase)
      .newObject('db');
    console.log(settings.logs.join('\n'));
    expect(db).to.equal("8.8.8.8:1234,8.8.4.4:1234");
  });

  it("should load entire objects", () => {
    const settings = {
      objects: true,
      log: true
    };
    const db = loadConfig(config, settings)()
      .bindName('db').toObject(objectTestDatabase)
      .newObject('db');
    console.log(settings.logs.join('\n'));
    expect(db).to.equal('{"host":"localhost","port":1234,"seeds":["8.8.8.8","8.8.4.4"],"debug":true}');
  });
});