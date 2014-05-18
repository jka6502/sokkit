(function() {


	var fix		= require('../fix'),
		Should	= require('should'),
		Sokkit	= require('../../lib/sokkit'),
		pollute	= fix.pollute;


	describe('when using Sokkit.instantiate', function() {


		describe('on plugins that all succeed', function() {

			var sokkit	= new Sokkit().load(),
				Plugin1	= sokkit.plugins.plugin1,
				Plugin2	= sokkit.plugins.plugin2,
				mine	= {};

			var errors = sokkit.instantiate(mine);

			it('should contain an instance of Plugin1', function() {
				sokkit.plugins.plugin1.should.be.an.instanceof(Plugin1);
				sokkit.should.include(sokkit.plugins.plugin1);
			});

			it('should contain an instance of Plugin2', function() {
				sokkit.plugins.plugin2.should.be.an.instanceof(Plugin2);
				sokkit.should.include(sokkit.plugins.plugin2);
			});

			it('should have only invoked the constructor once (1)', function() {
				sokkit[0].param.should.have.length(1);
			});

			it('should have only invoked the constructor once (2)', function() {
				sokkit[1].param.should.have.length(1);
			});

			it('should have supplied the exact parameters (1)', function() {
				sokkit[0].param[0].should.be.exactly(mine);
			});

			it('should have supplied the exact parameters (2)', function() {
				sokkit[1].param[0].should.be.exactly(mine);
			});

			it('should have reported no errors', function() {
				errors.should.have.length(0);
			});

		});


		describe('with a polluted Object.prototype', function() {

			var sokkit	= new Sokkit().load(),
				Plugin1	= sokkit.plugins.plugin1,
				Plugin2	= sokkit.plugins.plugin2,
				mine	= {};

			it('instantiation should still succeed', function() {

				pollute(function() {

					var errors = sokkit.instantiate(mine);

					sokkit.plugins.plugin1.should.be.an.instanceof(Plugin1);
					sokkit.should.include(sokkit.plugins.plugin1);
					sokkit.plugins.plugin2.should.be.an.instanceof(Plugin2);
					sokkit.should.include(sokkit.plugins.plugin2);
					sokkit[0].param.should.have.length(1);
					sokkit[1].param.should.have.length(1);
					sokkit[0].param[0].should.be.exactly(mine);
					sokkit[1].param[0].should.be.exactly(mine);
					errors.should.have.length(0);
				});

			});

		});


		describe('on plugins where some fail', function() {

			var sokkit = new Sokkit({
					path: __dirname + '/instantiate/*.js'
				}).load(),

				errors = sokkit.instantiate();

			it('should fail to instantiate one plugin', function() {
				errors.should.have.length(1);
			});

			it('should report the correct plugin as failing', function() {
				errors[0].name.should.equal('plugin2');
			});

			it('should report the Error associated with the failure', function() {
				errors[0].error.should.be.an.instanceof(Error);
			});

			it('should disable to failed plugin', function() {
				sokkit.should.have.length(2);
				sokkit.plugins.should.not.have.property('plugin2');
			});

		});

		describe('on subsets of the same plugin', function() {

			var sokkit = new Sokkit().load(),

				subset1 = sokkit.subset(),
				subset2 = sokkit.subset();

			subset1.instantiate();
			subset2.instantiate();

			it('should not share instances between subsets', function() {
				subset1.plugins.plugin1.should.not.be.exactly(subset2.plugins.plugin1);
				subset1.plugins.plugin2.should.not.be.exactly(subset2.plugins.plugin2);
				subset1[0].should.not.be.exactly(subset2[0]);
				subset1[1].should.not.be.exactly(subset2[1]);
			});

		});

	});


})();