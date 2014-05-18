(function() {


	// Patch up isArray for testing, so that should.js 'include' works on Sokkit.
	var isArray = Array.isArray;
	Array.isArray = function(value) {
		return value instanceof Array || isArray(value);
	};


	module.exports = {

		// Pollute Object.prototype, to ensure iterating skips correctly.
		pollute: function(callback) {
			Object.prototype.pollutant = 4;
			try{
				callback();
			}finally{
				delete Object.prototype.pollutant;
			}
		}

	};


})();