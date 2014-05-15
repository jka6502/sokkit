(function() {


	var glob		= require('glob'),
		path		= require('path'),

		dirname		= path.dirname,
		basename	= path.basename,
		sep			= path.sep;


	function Sokkit(options) {
		this.failed		= [];
		this.modules	= {};
		this.disabled	= {};

		this.configure(options);
	}


	Sokkit.prototype = [];


	Sokkit.prototype = {

		configure: function(options) {
			options		= options || {};

			var path	= dirname(dirname(require.main.filename)),
				modules	= dirname(path);

			this.module		= options.module || basename(path);
			this.pattern	= options.pattern || (this.module + '-*');
			this.path		= options.path || (modules + sep + this.pattern);

		},

		load: function(callback) {
			var sokkit	= this;

			function process(files) {
				for(var index = 0, length = files.length; index < length; index++) {
					var module = basename(files[index]);

					try{
						var result = require(module);
						sokkit.push(result);
						sokkit.modules[module] = result;
					}catch(error) {
						sokkit.failed.push({
							module: module,
							error: error
						});
					}
				}
				if (callback) { callback(null, sokkit); }
			}

			if (callback) {
				glob(this.path, function(error, files) {
					if (error) {
						console.warn('Plugin loading failed: ' + error);
						return;
					}
					process(files);
				});
			}else{
				process(glob.sync(this.path));
			}
			return this;
		},

		subset: function(filter) {
			var clone = new Sokkit({
				module:		this.module,
				pattern:	this.pattern,
				path:		this.path
			});

			var modules = this.modules;
			for(var module in modules) {
				if (!modules.hasOwnProperty(module)) { continue; }
				var plugin = modules[module];

				if (filter && filter(module, plugin)) {
					clone.push(plugin);
					clone.modules[module] = plugin;
				}
			}
		},

		instantiate: function() {
			var args	= Array.prototype.slice.call(arguments, 1),
				errors	= [],
				modules	= this.modules;

			var index = 0;

			for(var module in modules) {
				if (!modules.hasOwnProperty(module)) { continue; }

				try{
					var plugin = require(module),
						instance = Object.create(plugin);

					plugin.apply(instance, args);
					this[index++]	= instance;
					modules[module]	= instance;

				}catch(error) {
					errors.push({
						module:	module,
						error:	error
					});
					index++
				}
			}
			return errors;
		},

		call: function(method) {
			return this.apply(method, Array.prototype.slice.call(arguments, 1));
		},

		apply: function(method, args) {
			var result	= [],
				errors	= [],
				modules	= this.modules;

			result.errors = errors;

			for(var module in modules) {
				if (!modules.hasOwnProperty(module)) { continue; }
				var plugin = modules[module];
				try{
					result.push(plugin[method].apply(plugin, args));
				}catch(error) {
					errors.push({
						module: module,
						error: error
					});
				}
			}
			return result;
		},

		disable: function(module) {
			var plugin = this.modules[module];
			if (!plugin) { throw new Error('Unknown plugin: ' + module); }
			var index = this.indexOf(plugin);
			this.splice(index, 1);
			delete this.modules[module];
			this.disabled[module] = plugin;
		},

		enable: function(module) {
			var plugin = this.disabled[module];
			if (!plugin) { throw new Error('Unknown plugin: ' + module); }
			this.push(plugin);
			this.modules[module] = plugin;
			delete this.disabled[module];
		}

	};


	module.exports = Sokkit;


})();