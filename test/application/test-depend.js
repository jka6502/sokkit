(function() {


	var fix		= require('../fix'),
		Should	= require('should'),
		dirname	= require('path').dirname,
		Sokkit	= require('../../lib/sokkit'),
		pollute	= fix.pollute;


	describe('when using Sokkit.depend', function() {

			var sokkit = new Sokkit({
				path: [
					dirname(__dirname) + '/renamed-*',
					'$DEFAULT'
				]
			}).load();

		it('should verify when dependencies are met', function() {
			var subset = sokkit.subset(),
				depends = {
					'plugin1': ['plugin2'],
					'plugin2': ['renamed-plugin1']
				};

			var errors = subset.depend(function(name, plugin) {
				name.should.be.ok;
				plugin.should.be.ok;
				return depends[name];
			});

			errors.should.have.length(0);
		});

		it('should indicate correctly when a dependency is NOT met', function() {
			var subset = sokkit.subset(),
				depends = {
					'plugin1': ['renamed-plugin1'],
					'plugin2': ['unknown-dependency']
				};

			var errors = subset.depend(function(name, plugin) {
				name.should.be.ok;
				plugin.should.be.ok;
				return depends[name];
			});

			errors.should.have.length(1);
			subset.should.have.length(2);
			errors[0].name.should.equal('plugin2');
			errors[0].error.should.be.an.instanceof(Error);
		});

		it('should disable unmet dependencies', function() {
			var subset = sokkit.subset(),
				depends = {
					'plugin1': ['renamed-plugin1'],
					'plugin2': ['unknown-dependency']
				};

			var errors = subset.depend(function(name, plugin) {
				name.should.be.ok;
				plugin.should.be.ok;
				return depends[name];
			});

			errors.should.have.length(1);
			errors[0].name.should.equal('plugin2');
			errors[0].error.should.be.an.instanceof(Error);
			subset.should.have.length(2);
			subset.disabled.should.have.property('plugin2');
			subset.plugins.should.not.have.property('plugin2');
		});

		it('should fail chained dependencies', function() {
			var subset = sokkit.subset(),
				depends = {
					'plugin1': ['plugin2'],
					'plugin2': ['unknown-dependency']
				};

			var errors = subset.depend(function(name, plugin) {
				name.should.be.ok;
				plugin.should.be.ok;
				return depends[name];
			});

			errors.should.have.length(2);
			[errors[0].name, errors[1].name].should.include('plugin1');
			[errors[0].name, errors[1].name].should.include('plugin2');
			errors[0].error.should.be.an.instanceof(Error);
			errors[1].error.should.be.an.instanceof(Error);
			subset.should.have.length(1);
			subset.disabled.should.have.property('plugin1');
			subset.disabled.should.have.property('plugin2');
			subset.plugins.should.not.have.property('plugin1');
			subset.plugins.should.not.have.property('plugin2');
		});

		it('should survive cyclic dependencies', function() {
			var subset = sokkit.subset(),
				depends = {
					'plugin1': ['plugin2'],
					'plugin2': ['plugin1']
				};

			var errors = subset.depend(function(name, plugin) {
				name.should.be.ok;
				plugin.should.be.ok;
				return depends[name];
			});

			subset.should.have.length(3);
			errors.should.have.length(0);
		});

		it('should allow multiple dependencies per plugin', function() {
			var subset = sokkit.subset(),
				depends = {
					'plugin1': ['plugin2', 'renamed-plugin1']
				};

			var errors = subset.depend(function(name, plugin) {
				name.should.be.ok;
				plugin.should.be.ok;
				return depends[name];
			});

			subset.should.have.length(3);
			errors.should.have.length(0);
		});

		it('should require ALL dependencies, when multiple exist', function() {
			var subset = sokkit.subset(),
				depends = {
					'plugin1': ['plugin2', 'unknown-plugin1']
				};

			var errors = subset.depend(function(name, plugin) {
				name.should.be.ok;
				plugin.should.be.ok;
				return depends[name];
			});

			errors.should.have.length(1);
			errors[0].name.should.equal('plugin1');
			errors[0].error.should.be.an.instanceof(Error);
			subset.should.have.length(2);
			subset.disabled.should.have.property('plugin1');
			subset.plugins.should.not.have.property('plugin1');
		});

		it('should survive a polluted Object.prototype', function() {
			pollute(function() {
				var subset = sokkit.subset(),
					depends = {
						'plugin1': ['plugin2', 'unknown-plugin1'],
						'plugin2': ['renamed-plugin1']
					};

				var errors = subset.depend(function(name, plugin) {
					name.should.be.ok;
					plugin.should.be.ok;
					return depends[name];
				});

				errors.should.have.length(1);
				errors[0].name.should.equal('plugin1');
				errors[0].error.should.be.an.instanceof(Error);
				subset.should.have.length(2);
				subset.disabled.should.have.property('plugin1');
				subset.plugins.should.not.have.property('plugin1');
			});
		});


	});


})();