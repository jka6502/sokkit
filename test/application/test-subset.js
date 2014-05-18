(function() {


	var fix		= require('../fix'),
		Should	= require('should'),
		Sokkit	= require('../../lib/sokkit'),
		pollute	= fix.pollute;


	describe('when using Sokkit.subset', function() {

		var sokkit = new Sokkit().load();

		it('copies all plugins with no filter function', function() {

			var subset = sokkit.subset();

			subset.should.have.length(2);
			subset.should.include(sokkit[0]);
			subset.should.include(sokkit[1]);
			subset.plugins.should.have.keys('plugin1', 'plugin2');
			subset.plugins.plugin1.should.be.exactly(sokkit.plugins.plugin1);
			subset.plugins.plugin2.should.be.exactly(sokkit.plugins.plugin2);
		});

		it('copies only plugins that pass the filter function', function() {
			var subset = sokkit.subset(function(name, plugin) {
				return name === 'plugin1';
			});
			subset.should.have.length(1);
			subset.should.include(sokkit.plugins.plugin1);
			subset.should.not.include(sokkit.plugins.plugin2);
			subset.plugins.should.have.keys('plugin1')
			subset.plugins.plugin1.should.be.exactly(sokkit.plugins.plugin1);
		});

		it('survived a polluted Object.prototype', function() {
			pollute(function() {
				var subset = sokkit.subset();

				subset.should.have.length(2);
				subset.should.include(sokkit[0]);
				subset.should.include(sokkit[1]);
				subset.plugins.should.have.keys('plugin1', 'plugin2');
				subset.plugins.plugin1.should.be.exactly(sokkit.plugins.plugin1);
				subset.plugins.plugin2.should.be.exactly(sokkit.plugins.plugin2);
			});
		});

	});


})();