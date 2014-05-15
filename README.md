# Sokkit

*Its where yer plugins go, innit?*

A simple, unopinionated plugin handler for npm modules.

Discover, load, instantiate and/or execute methods on all of your plugins with
ease - Just decide on a suitable pattern, or use the `mymodule-pluginname`
default, and away you go!

## Installation

Install via [npm](https://www.npmjs.org/), and save it as a dependency for your
project.

``` bash
npm install sokkit --save
```

## Configuration

Require the `Sokkit` class, and create an instance.

``` JS
var Sokkit = require('sokkit');

var sokkit = new Sokkit();
```

The owning module name will automatically be detected, or you may override this
by supplying a `module` option.

``` JS
var sokkit = new Sokkit({ module: 'mymodule' });
```

Call the `load()` method to discover, and load any plugin modules.

``` JS
var plugins = sokkit.load();
```

Or call it asynchronously, by supplying a callback:

``` JS
sokkit.load(function(error, plugins) {
	// do important stuff.
});
```

Failures to detect plugins, or file system failures throw an `Error` in
synchronous mode, or pass the `error` parameter to the `callback` supplied in
asynchronous mode.

Actual plugin load failures, however, populate the `failed` array property with
objects containing `module` and `error` keys.

``` JS
if (sokkit.failed.length) {
	console.log("The following plugins failed to load:\n",
		sokkit.failed.map(function(fail) {
			return '   ' + fail.module + ': ' + fail.error;
		}).join('\n')
	);
}
```

By default Sokkit will search the same `node_modules` directory that your module
resides in for any modules named `yourmodule-*`, and attempt to `require` them.

You can override the search directory by supplying a `path` option:

``` JS
var dirname = require('path').dirname;

var sokkit = new Sokkit({
	path: dirname(require.main.filename) + '/plugins'
});
```

Or override the plugin naming pattern, by supplying a
[glob](https://github.com/isaacs/node-glob) compatible pattern.

``` JS
var sokkit = new Sokkit({
	pattern: 'mymodule-*-{plugin,extension}'
});
```

## Usage

The `Sokkit` instance is actually an array.  Once `load` has returned (in
synchronous mode), or the supplied `callback` has been called (in asynchronous
mode), it will contain the `module.exports` of all plugin modules found.

From there, you can iterate over the loaded plugins, as you would with any
other array:

``` JS
sokkit.forEach(function(plugin) {
	// ... do something with plugin ...
});
```

You should, however, not manipulate the contents directly, or use `slice()` to
obtain a subset of plugins.  Instead, use `subset`, and supply an *optional*
function to filter that set, which will result in an appropriate subset of
modules.

``` JS
var group = sokkit.subset(function(module, plugin) {
	return plugin.isGroupMember || module.indexOf('group_name');
});
```

Subsets do not retain the `failed` properties of their parents.

Subsets are also independent plugin lists, they reference the same exports, but
are unique sets in their own right.  This means you can `load` plugins, create
two subsets, run `instantiate` on each, and maintain two completely independent
sets of plugin instances.

If you need access to the actual module names, you can use the `modules`
property:

``` JS
var modules = sokkit.modules;
for(var module in modules) {
	if (!modules.hasOwnProperty(module)) { continue; }
	var plugin = modules[module];
	// ... do something with module and plugin ...
}
```

Sokkit is not opinionated, there is no enforced design on your plugin structure.
How your plugins interact with your application is left to the developer's
discretion, but three methods are supplied to assist in those interactions.

The `call` method invokes the `method` supplied on every succesfully loaded
plugin with the remaining paramters:

``` JS
sokkit.call('init', this, config.plugin);

// For all plugins, call: plugin.init(this, config.plugin)
```

The `call` method will return an array, containing the return values of every
successful call made.

An additional property on the returned array, `errors` will contain objects with
`module` and `error` properties, describing details of any plugins that threw
exceptions while processing the request.

The `apply` method works exactly the same as `call`, except the arguments are
passed as an array:

``` JS
sokkit.apply('init', [this, config.plugin]);
```

## Instanced plugins

If you prefer modular plugins, the final helper function, `instantiate` can be
used to treat each plugin as a constructor, and instantiate instances from each
with the parameters supplied.

``` JS
var errors = sokkit.instantiate(this);
```

The returned array will contain objects with `module` and `error` properties,
listing any plugins that threw exceptions while being instantiated.

If a plugin misbehaves, or is not required, it can be disabled:

``` JS
sokkit.disable(module);
```

And later reenabled:

``` JS
sokkit.enable(module);
```

Diabled plugins will no longer appear in the `sokkit` array, the `modules`
property, appear in any `subset`s or be affected by `call`, `apply`, or
`instantiate`.

## So, how does this help me?

Well, it means you can pick a naming scheme, and automatically discover and
work with plugins, as long as they implement that naming scheme, and your chosen
plugin API.

This, in turn, means that your users can, for instance:

``` bash
npm install yourmodule
npm install yourmodule-plugin1
npm install yourmodule-plugin2
```

and have those plugins working automatically, right out of the box.

Alternatively, developers that depend on your module can do exactly the same,
but by specifying plugins as dependencies too, in their `package.json`:

``` JS
{
	"name": "superapplication",
	"version": "0.1.0",
	"author": "Bob",
	"description": "the very best application",

	"dependencies": [
		"yourmodule": "^0.1.0",
		"yourmodule-plugin1": "^0.1.0"
		"yourmodule-plugin2": "^0.2.0"
	]
}
```
And, when they access your module, the plugins will be available too.

## Finally

Have fun!
