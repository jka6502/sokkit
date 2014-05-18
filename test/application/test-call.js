(function() {


	var fix		= require('../fix'),
		Should	= require('should'),
		Sokkit	= require('../../lib/sokkit');


	describe('when using Sokkit.call', function() {

		var sokkit = new Sokkit().load();

		var result = sokkit.call('func', 1, 2);

		it('should return the correct results', function() {
			result.should.have.length(2);
			result.should.include(2);
			result.should.include(3);
		});

		it('should not have reported any failures', function() {
			result.errors.should.have.length(0);
		});

	});


})();