(function() {

	var glob		= require('glob'),
		Mocha		= require('mocha'),
		set			= glob.sync(__dirname + '/**/test-*.js');

	var mocha = new Mocha({
		reporter: 'spec'
	});

	set.forEach(function(filename) {
		mocha.addFile(filename);
	});

	mocha.run(function(failures){
	  process.on('exit', function () {
	    process.exit(failures);
	  });
	});

})();
