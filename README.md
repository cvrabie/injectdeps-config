# injectdeps-config
Allows the binding of configuration constants provided by the [node-config](https://github.com/lorenwest/node-config)
library through the [injectdeps](https://github.com/pjshumphreys/injectdeps) IoC container.

See the [node-config](https://github.com/lorenwest/node-config) documentation for how the configuration
files need to be named and various other options like loading them from a `yaml` file instead of a json.

## Eager binding
For the simplest operation you can just call the config loader with an injectdeps container as parameter.
This loads **all** the compatible configurations from the config file and binds them as constants.
By default the keys used for the binding will be the json path to the configuration.

Assuming this is your `config/default.json`

```json
{
	"app": {
		"db": {
			"host": "localhost",
			"port": 1234,
			"seeds": ["8.8.8.8","8.8.4.4"]
		}
	},
  "other": {
    "foo":"bar"
  }
}
```

You can define your injected module like this

```javascript
module.exports = require('injectdeps')(['app.db.host', 'app.db.port', 'app.db.debug'], function(host, port, debug){
  return `${host}:${port}:${debug}`;
});
```

When you initialise your container also import the default binder module and load it into the container:

```javascript
const container = injector.getContainer();
const configLoader = require('injectdeps-config')(config, {});
const db = configLoader(container)
  .bindName('db').toObject(defaultDatabase)
  .newObject('db');
```

or shorter:

```javascript
require('injectdeps-config')(config, {})()
  .bindName('db').toObject(defaultDatabase)
  .newObject('db');
```

In the above example we don't provide a container to the loader, which means a new one will be created.

Various configuration options for the binder are described below. For this you should instantiate an `EagerBinder` instead of using `defaultEagerBinderModule`

```javascript
const settings = {
  log: true,
  root: 'app',
  prefix: 'cfg',
  objects: true
};
require('injectdeps-config')(config, settings)();
```

### Binding only part of the configuration file

Use the `root` configuration parameter of the eager binder. This will only load children of this particular path. For our above example:

```javascript
{
  root: 'app'
};
```
only loads the `app` breanch of the configuration. The keys necessary for injecting are also shortened.

```javascript
require('injectdeps')(['db.host', 'db.port'], function(host, port){});
```

### Adding a prefix to the binding key

In order to avoid collisions you can add a prefix to the binding keys. For our above example:
```javascript
{
  root: 'app',
  prefix: 'cfg'
};
```

This makes correct biding:

```javascript
require('injectdeps')(['cfg.db.host', 'cfg.db.port'], function(host, port){});
```

Note that there is no `cfg` key in the configuration json.

### Binding entire objects

In addition to binding every leaf entry of the configuration, you can also bind the intermediary object by turning on `objects` in the EagerBinder settings.

```javascript
{
  root: 'app',
  objects: true
};
```

This will bind to constants `db.host`, `db.port`, `db.seeds` but also `db` as the constant object
```javascript
{
  host: "localhost",
  port: 1234,
  seeds: ["8.8.8.8","8.8.4.4"]
}
```

### Binding logs

For debugging purposes, you can turn on binding logs
```javascript
{
  log: true
};
```

This allows you to get an array of logs from the settings object after the binding is done.

```javascript
console.log( settings.logs.join("\n") );
```

```
Binding 'cfg.db.host' to string 'localhost'
Binding 'cfg.db.port' to number '1234'
Binding 'cfg.db.seeds' to string[] '8.8.8.8,8.8.4.4'
```
