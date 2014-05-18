(function() {


	var fix		= require('../../../fix'),
		Should	= require('should'),
		Sokkit	= require('../../../../lib/sokkit'),
		dirname	= require('path').dirname;


	describe('when using Sokkit from a deep subpath', function() {

		it('still find the correct default root path', function() {
			var sokkit = new Sokkit().load();

			sokkit.root().should.equal(dirname(dirname(__dirname)));
		});

	});


})();