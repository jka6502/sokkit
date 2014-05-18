(function() {


	var fix		= require('../fix'),
		Should	= require('should'),
		Sokkit	= require('../../lib/sokkit'),

		sokkit = new Sokkit().load(),
		plugin1 = sokkit.plugins.plugin1;


	describe('when disabling a plugin', function() {

		it('should return true if successful', function() {
			sokkit.disable('plugin1').should.be.true;
		});

		it('should have removed all reference to the plugin', function() {
			sokkit.should.have.length(1);
			sokkit.plugins.should.not.have.keys('plugin1');
			sokkit.should.not.include(plugin1);
		});

		it('should return false if disabling an already disabled plugin', function() {
			sokkit.disable('plugin1').should.be.false;
		});

		it('should return false if disabling a missing plugin', function() {
			sokkit.disable('plugin5').should.be.false;
		});

	});


	describe('when enabling a plugin', function() {

		it('should return true if successful', function() {
			sokkit.enable('plugin1').should.be.true;
		});

		it('should contain the enabled plugin', function() {
			sokkit.should.have.length(2);
			sokkit.plugins.should.have.property('plugin1');
			sokkit.should.include(plugin1);
		});

		it('should return false if enabling an already enabled plugin', function() {
			sokkit.enable('plugin1').should.be.false;
		});

		it('should return false if enabling a missing plugin', function() {
			sokkit.enable('plugin5').should.be.false;
		});

	});


})();