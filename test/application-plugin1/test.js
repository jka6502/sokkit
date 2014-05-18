(function() {

	function Plugin1(param) {
		if (!this.param) { this.param = []; }
		this.param.push(param);
	}

	Plugin1.type	= 'plugin1';
	Plugin1.value	= 7;

	Plugin1.func = function(a, b) {
		return a + b;
	};

	Plugin1.fail = function() {
		return true;
	};

	Plugin1.fail2 = function() {
		return Plugin1.nonExistant.property;
	};

	Plugin1.prototype = {

		method: function(val) {
			return val + 1;
		},

		value: 23

	};

	module.exports = Plugin1;


})();
