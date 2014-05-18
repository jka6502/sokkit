(function() {

	function Plugin2(param) {
		if (!this.param) { this.param = []; }
		this.param.push(param);
	}

	Plugin2.type	= 'plugin2';
	Plugin2.value	= 42;

	Plugin2.func = function(a, b) {
		return a * b;
	};

	Plugin2.fail2 = function() {
		return 'success';
	};

	Plugin2.prototype = {

		method: function(val) {
			return val + 1;
		},

		value: 24

	};

	module.exports = Plugin2;


})();
