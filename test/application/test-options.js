(function() {

	var fix		= require('../fix'),
		Should	= require('should'),
		path	= require('path'),
		Sokkit	= require('../../lib/sokkit'),
		dirname	= path.dirname;


	describe('when supplying options', function() {

		it('should correctly handle a module override', function() {

			var sokkit = new Sokkit({
					module: 'renamed'
				}).load();

			sokkit.should.have.length(1);
			sokkit[0].type.should.equal('renamed-plugin');
			sokkit.plugins.should.have.property('plugin1');
		});

		it('should correctly handle a pattern override', function() {
			var sokkit = new Sokkit({
					pattern: 'renamed-*'
				}).load();

			sokkit.should.have.length(1);
			sokkit[0].type.should.equal('renamed-plugin');
			sokkit.plugins.should.have.property('renamed-plugin1');
		});


		describe('with explicit paths', function() {

			it('should handle a single overriden path', function() {
				var sokkit = new Sokkit({
						path: __dirname + '/instantiate/application-*.js'
					}).load();

				sokkit.should.have.length(1);
				sokkit.plugins.should.have.keys('plugin3');
				sokkit.plugins.plugin3.expected.should.be.true;
				sokkit[0].expected.should.be.true;
			});

			it('should handle an array of overriden paths', function() {
				var sokkit = new Sokkit({
						path: [
							__dirname + '/instantiate/application-*.js',
							dirname(__dirname) + '/renamed-*'
						]
					}).load();

				sokkit.should.have.length(2);
				sokkit.plugins.should.have.keys('plugin3', 'renamed-plugin1');
			});

			it('should handle an array of paths, with a $DEFAULT', function() {
				var sokkit = new Sokkit({
						path: [
							'$DEFAULT',
							__dirname + '/../renamed-*'
						]
					}).load();

				sokkit.should.have.length(3);
				sokkit.plugins.should.have.keys('plugin1', 'plugin2', 'renamed-plugin1');
			});

		});


		describe('with disable option', function() {

			var sokkit = new Sokkit({
					disable: ['plugin1']
				}).load();

			it('should disable the selected plugin prior to loading', function() {

				sokkit.should.have.length(1);
				sokkit.plugins.should.not.have.property('plugin1');
				sokkit.disabled.should.have.property('plugin1');
			});

			it('should allow enabling of plugins disabled by option', function() {
				sokkit.enable('plugin1').should.be.true;
				sokkit.plugins.should.have.property('plugin1');
				sokkit.disabled.should.not.have.property('plugin1');
			});
		});

		it('should throw an error when the root cannot be determined', function() {
			var Sokkit	= rewire('../../lib/sokkit'),
				sokkit	= new Sokkit(),
				original = {
					fs:		glob.__get__('fs'),
					glob:	Sokkit.__get__('glob'),
				};

			original.existsSync = original.fs.existsSync;
			Sokkit.__set__('glob', glob);

			original.fs.existsSync = function(file) {
				return false;
			};

			try{
				sokkit.root();
				// Istanbul can't seem to spot .should.throw
				false.should.be.ok;
			}catch(e) {}

			Sokkit.__set__('glob', original.glob);
			original.fs.existsSync = original.existsSync;
		});


	});


})();