(function() {


	var extend		= require('stratum-framework/lib/extend'),
		fs			= require('fs'),
		glob		= require('glob'),
		path		= require('path'),

		dirname		= path.dirname,
		basename	= path.basename,
		sep			= path.sep;


	var Sokkit = extend(function Sokkit(options) {
		this.failed		= [];
		this.plugins	= {};
		this.paths		= {};
		this.disabled	= {};

		this.configure(options);
	},

	Array,

	{

		configure: function(options) {
			options		= options || {};

			var path	= this.root(),
				auto	= dirname(path);

			this.module		= options.module || basename(path);
			this.pattern	= options.pattern || (this.module + '-*');

			if (options.disable) {
				var disable = options.disable;
				for(var index = 0, length = disable.length; index < length; index++) {
					this.disabled[disable[index]] = {};
				}
			}

			var $DEFAULT = auto + sep + this.pattern;

			this.path		= options.path || $DEFAULT;

			if (this.path instanceof Array) {
				this.path = '{' + this.path.map(function(path) {
					return path === '$DEFAULT' ? $DEFAULT : path
				}).join(',') + '}';
			}
		},

		root: function() {
			var path = dirname(require.main.filename);
			while(path.length) {
				if (fs.existsSync(path + sep + 'package.json')) { return path; }
				path = dirname(path);
			}
			throw new Error('Failed to find module root');
		},

		load: function(callback) {
			var sokkit	= this,
				prefix	= this.module + '-';

			function process(files) {
				for(var index = 0, length = files.length; index < length; index++) {
					var name = basename(files[index]);

					if (name.substring(name.length - 3) === '.js') {
						name = name.substring(0, name.length - 3);
					}

					if (name.substring(0, prefix.length) === prefix) {
						name = name.substring(prefix.length);
					}

					if (sokkit.disabled[name]) {
						sokkit.disabled[name].path = files[index];
						continue;
					}

					try{
						var result = require(files[index]);
						sokkit.push(result);
						sokkit.plugins[name] = result;
						sokkit.paths[name] = files[index];
					}catch(error) {
						sokkit.failed.push({
							name: name,
							error: error
						});
					}
				}
				if (callback) { callback(null, sokkit); }
			}

			if (callback) {
				glob(this.path, function(error, files) {
					if (error) {
						callback(error);
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

			var plugins	= this.plugins,
				paths	= this.paths;
			for(var name in plugins) {
				if (!plugins.hasOwnProperty(name)) { continue; }
				var plugin = plugins[name];

				if (filter && filter(name, plugin)) {
					clone.push(plugin);
					clone.paths[name]	= paths[name];
					clone.plugins[name]	= plugin;
				}
			}
			return clone;
		},

		instantiate: function() {
			var errors	= [],
				plugins	= this.plugins;

			var index = 0;

			for(var name in plugins) {
				if (!plugins.hasOwnProperty(name)) { continue; }

				try{
					var plugin		= require(this.paths[name]),
						instance	= Object.create(plugin.prototype);

					plugin.apply(instance, arguments);
					this[index++]	= instance;
					plugins[name]	= instance;
				}catch(error) {
					errors.push({
						name:	name,
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
				plugins	= this.plugins;

			result.errors = errors;

			for(var name in plugins) {
				if (!plugins.hasOwnProperty(name)) { continue; }
				var plugin = plugins[name];
				try{
					result.push(plugin[method].apply(plugin, args));
				}catch(error) {
					errors.push({
						name:	name,
						error:	error
					});
				}
			}
			return result;
		},

		disable: function(name) {
			var plugin	= this.plugins[name],
				path	= this.paths[name];

			if (!plugin) { return false; }

			var index = this.indexOf(plugin);
			this.splice(index, 1);

			delete this.plugins[name];
			delete this.paths[name];

			this.disabled[name] = {
				path:	this.paths[name],
				plugin:	plugin
			};

			return true;
		},

		enable: function(name) {
			var details = this.disabled[name];

			if (!details) { return false; }
			if (!details.plugin) { details.plugin = require(details.path); }

			this.push(details.plugin);

			this.paths[name]	= details.path;
			this.plugins[name]	= details.plugin;

			delete this.disabled[name];

			return true;
		},

		depend: function(retrieve) {
			var sokkit	= this,
				plugins	= this.plugins,
				errors	= [],
				done	= true;

			do{
				done = true;
				for(var name in plugins) {
					if (!plugins.hasOwnProperty(name)) { continue; }
					var required = retrieve(name, plugins[name]);
					if (!required) { continue; }

					for(var index = 0, length = required.length;
							index < length; index++) {
						var depend = required[index];
						if (!plugins[name]) {
							errors.push({
								name:	name,
								error:	new Error(name + ' requires ' + depend)
							});
							this.disable(name);
							done = false;
						}
					}
				}

			}while(!done);
			return errors;
		}


	});


	module.exports = Sokkit;


})();