# Sokkit

*Its where yer plugins go, innit?*

A simple, unopinionated plugin handler for npm modules.

Discover, load, instantiate and/or execute methods on all of your plugins with
ease - Just decide on a suitable file pattern, or use the `mymodule-pluginname`
default, and away you go!

* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)
* [Subsets](#subsets)
* [Instanced plugins](#instanced-plugins)
* [Enabling and disabling](#enabling-and-disabling)
* [Plugin dependency management](#plugin-dependency-management)
* [So, how does this help me?](#so-how-does-this-help-me)

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

Call the `load()` method to discover, and load any plugins.

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
objects containing `name` and `error` keys.

``` JS
if (sokkit.failed.length) {
	console.log("The following plugins failed to load:\n",
		sokkit.failed.map(function(fail) {
			return '   ' + fail.name + ': ' + fail.error;
		}).join('\n')
	);
}
```

By default Sokkit will search the same `node_modules` directory that your module
resides in for any other modules named `yourmodule-*`, and attempt to `require`
them.

You can override the search directory by supplying a `path` option:

``` JS
var dirname = require('path').dirname;

var sokkit = new Sokkit({
	path: dirname(require.main.filename) + '/plugins'
});
```

Additionally, you can specify an array of alternate paths, and even include the
default by specifying `$DEFAULT` within the array:

``` JS
var sokkit = new Sokkit({
	path: [
		dirname(require.main.filename) + '/plugins',
		dirname(require.main.filename) + '/extras',
		'$DEFAULT'
	]
});
```

Or override the plugin file naming pattern, by supplying a
[glob](https://github.com/isaacs/node-glob) compatible pattern.

``` JS
var sokkit = new Sokkit({
	pattern: 'mymodule-*-{plugin,extension}'
});
```

Additionally, plugins can be prevented from loading at all, by supplying a
`disable` array during construction, and supplying the names of plugins to
prevent:

``` JS
var sokkit = new Sokkit({
	disable: ['plugin1', 'plugin2']
});
```

## Usage

The `Sokkit` instance is actually an array.  Once `load` has returned (in
synchronous mode), or the supplied `callback` has been called (in asynchronous
mode), it will contain the `module.exports` of all plugins found.

From there, you can iterate over the loaded plugins, as you would with any
other array:

``` JS
sokkit.forEach(function(plugin) {
	// ... do something with plugin ...
});
```

Or use `Array` functions, such as `map`, `filter`, `join`, to perform operations
or aggregate information about your loaded plugins.

If you need access to the actual plugin names, you can use the `plugins`
property:

``` JS
var plugins = sokkit.plugins;
for(var name in plugins) {
	if (!plugins.hasOwnProperty(name)) { continue; }
	var plugin = plugins[name];
	// ... do something with name and plugin ...
}
```

Sokkit is not opinionated, there is no enforced design on your plugin structure.
How your plugins interact with your application is left to the developer's
discretion, but several methods are supplied to assist in those interactions.

The `call` method invokes the `method` supplied on every succesfully loaded
plugin with the remaining parameters:

``` JS
sokkit.call('init', this, config.plugin);

// For all plugins, call: plugin.init(this, config.plugin)
```

The `call` method will return an array, containing the return values of every
successful call made.

An additional property on the returned array, `errors` will contain objects with
`name` and `error` properties, describing details of any plugins that threw
exceptions while processing the request.

The `apply` method works exactly the same as `call`, except the arguments are
passed as an array:

``` JS
sokkit.apply('init', [this, config.plugin]);
```

## Plugin naming

Plugins have a name associated, which can be used to reference them when
validating dependencies, enabling, disabling, or accessing via
`sokkit.plugins[name]`.

The name is automatically assigned during discovery from the module directory
name, or direct script filename matched by the discovery pattern.

In order to maintain consistency, and prevent app-name-soup, the following
transformations occur when a plugin is discovered.

If the plugin is contained in a single script file, the `.js` extension is
removed.

If the plugin is discovered in a module called `application-pluginname`, or a
file named `application-plugin.js` then the `application-` prefix is removed, so
an application using the following plugins:

`
	node_modules/application-plugin1/
	node_modules/application-plugin2/

	./components/feature1.js
	./components/application-feature2.js
`

Will have the following plugins:
`
	plugin1
	plugin2
	feature1
	feature2
`

## Subsets

The `Sokkit` instance is an `Array`.  You should, however, not manipulate the
contents directly, or use `slice()` to obtain a subset of plugins (it'll return
an array, not a Sokkit instance).  Instead, use `subset()`, and supply an
*optional* function to filter that set, which will result in a `Sokkit` instance
containing a subset of plugins.

``` JS
var group = sokkit.subset(function(name, plugin) {
	return plugin.isGroupMember || name.indexOf('group_name');
});
```

Subsets do not retain the `failed` properties of their parents.

Subsets are also independent plugin lists, they reference the same exports, but
are unique sets in their own right.  This means you can `load` plugins, create
two subsets, run `instantiate` on each, and maintain two completely independent
sets of plugin instances.

## Instanced plugins

If you prefer modular plugins, the helper function, `instantiate` can be
used to treat each plugin as a constructor, and instantiate those those objects
with the parameters supplied.

``` JS
var errors = sokkit.instantiate(this);

// The equivalent of:
//	sokkit[0] = new sokkit[0](this);
//	sokkit[1] = new sokkit[1](this);
//	...
```

The returned array will contain objects with `name` and `error` properties,
listing any plugins that threw exceptions while being instantiated.

## Enabling and disabling

If a plugin misbehaves, or is not required, it can be disabled:

``` JS
sokkit.disable(name);
```

And later reenabled:

``` JS
sokkit.enable(name);
```

Diabled plugins will no longer appear in the `sokkit` array, the `plugins`
property, appear in any `subset`s or be affected by `call`, `apply`, or
`instantiate`.

Plugins disabled during construction, and thereby never actually loaded can be
enabled, just like any other plugin.

## Plugin dependency management

In order to remain unopinionated, there is no enforced method of dependency
management between plugins, but there is a helper function to simplify the task,
should you need it.

Create a `retrieve` callback to return an array of dependencies for any given
plugin, and pass it to the `depend` method to automatically verify dependencies,
disabling any plugins that have not had their dependencies satisfied.

Additionally, this method will return the, now familiar, error array describing
any plugins that have been disabled due to a dependency failure.

``` JS
var errors = sokkit.depend(function(name, plugin) {
	return plugin.requires;
});
```

## So, how does this help me?

Well, it means you can pick a naming scheme, and automatically discover and
work with plugins, using whatever actual plugin API you prefer.

This, in turn, means that your users can, for instance:

``` bash
npm install yourmodule
npm install yourmodule-plugin1
npm install yourmodule-plugin2
```

and have those plugins working automatically, right out of the box.  No
configuration, or editing of `package.json` files to enable them, or ensure
they are loaded/linked correctly.

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
And, when they access your module, the plugins will be available too - all
automatically discovered, loaded and ready to use.

Personally, I like to use this as an automatic aggregator for components within
my own software too - use an array of paths, including some way of picking up
internal *plugins*.

``` js
	function MyAPI() {
		this.plugins = new Sokkit({
			path: [
				// Internal component path
				dirname(require.main.filename) . '/components/**/*.js',
				// External plugin path
				'$DEFAULT'
			]
		}).load();
	}
```

This style not only allows you to make every component of your system an
effective example plugin, but also forces you, the developer, to consider
encapsulation and separation of concerns within your architecture - and in turn
consider your plugin API, its usability, scalability, etc, from the outset.

## Finally

Have fun!
