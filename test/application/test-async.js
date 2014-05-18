(function() {


	var fix		= require('../fix'),
		Should	= require('should');
		path	= require('path'),
		rewire	= require('rewire'),
		glob	= rewire(require.resolve('glob')),
		Sokkit	= rewire('../../lib/sokkit');


	describe('a Sokkit instance loading asynchronously', function() {

		var sokkit;

		it('should perform asynchronous discovery', function(done) {
			sokkit = new Sokkit().load(done);
		});

		it('should have detected the correct plugins', function() {
			sokkit.should.have.length(2);
			sokkit.plugins.should.have.keys('plugin1', 'plugin2');
		});

		it('should propagate errors via the callback error param', function(done) {
			var original = {
				fs:		glob.__get__('fs'),
				glob:	Sokkit.__get__('glob'),
			};

			original.readdir = original.fs.readdir;
			Sokkit.__set__('glob', glob);

			original.fs.readdir = function(file, callback) {
				callback(new Error('FS FAIL!'));
			};

			new Sokkit().load(function(error, result) {
				(error == null).should.not.be.ok;
				error.should.be.instanceof(Error);

				Sokkit.__set__('glob', original.glob);
				original.fs.readdir = original.readdir;

				done();
			});

		});

	});


})();