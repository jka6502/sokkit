(function() {


	var fix		= require('../fix'),
		Should	= require('should'),
		Sokkit	= require('../../lib/sokkit'),
		using	= fix.using,
		pollute	= fix.pollute;


	describe('when using Sokkit.apply', function() {

		var sokkit = new Sokkit().load();


		describe('with a successful apply call', function() {

			var result = sokkit.apply('func', [1, 2]);

			it('should return the correct results', function() {
				result.should.have.length(2);
				result.should.include(2);
				result.should.include(3);
			});

			it('should not have reported any failures', function() {
				result.errors.should.have.length(0);
			});

		})


		describe('using apply with missing methods', function() {

			var result = sokkit.apply('fail', [1, 2]);

			it('should receive the correct return value', function() {
				result.should.have.length(1);
				result.should.include(true);
			});

			it('should have recorded a single failure', function() {
				result.errors.should.have.length(1);
			});

			it('should have recorded the failing plugin', function() {
				result.errors[0].name.should.equal('plugin2');
			});

			it('should have recorded the related Error', function() {
				result.errors[0].error.should.be.an.instanceof(Error);
			});

		});


		describe('using apply with error throwing methods', function() {

			var result = sokkit.call('fail2');

			it('should receive the correct return value', function() {
				result.should.have.length(1);
				result.should.include('success');
			});

			it('should have recorded a single failure', function() {
				result.errors.should.have.length(1);
			});

			it('should have recorded the failing plugin', function() {
				result.errors[0].name.should.equal('plugin1');
			});

			it('should have recorded the related Error', function() {
				result.errors[0].error.should.be.an.instanceof(Error);
			});

		});


		it('should survive a polluted Object.prototype', function() {
			pollute(function() {
				var result = sokkit.apply('func', [1, 2]);

				result.should.have.length(2);
				result.should.include(2);
				result.should.include(3);
				result.errors.should.have.length(0);
			});
		});

	});


})();