(function() {


	var fix		= require('../fix'),
		Should	= require('should'),
		Sokkit	= require('../../lib/sokkit');


	describe('an optionless synchronous Sokkit instance', function() {

		var sokkit = new Sokkit().load();

		it('should have detected the correct root path', function() {
			sokkit.root().should.equal(__dirname);
		});

		it('should have discovered the correct plugins', function() {
			sokkit.should.have.length(2);
			sokkit.plugins.should.have.keys('plugin1', 'plugin2');
		});

		it('should be self consistent', function() {
			sokkit.should.include(sokkit.plugins.plugin1);
			sokkit.should.include(sokkit.plugins.plugin2);
		});

		it('should have loaded the plugin modules', function() {
			sokkit.plugins.plugin1.value.should.equal(7);
			sokkit.plugins.plugin2.value.should.equal(42);
		});

		it('should have reported a single failure', function() {
			sokkit.failed.should.have.length(1);
		});

		it('should have reported plugin3 specifically as failed', function() {
			sokkit.failed[0].name.should.equal('plugin3');
		});

		it('should have supplied an Error for the failure', function() {
			sokkit.failed[0].error.should.be.an.instanceof(Error);
		});


	});


})();