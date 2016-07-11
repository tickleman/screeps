/**
 * Unit tests
 *
 * Run them from the console with require('tests').run();
 */

/**
 * Tests with errors counter
 *
 * @type int
 */
module.exports.errors = 0;

/**
 * Passed tests counter
 *
 * @type int
 */
module.exports.passed = 0;

/**
 * Test prefix for display
 *
 * @type string
 */
module.exports.prefix = 'test';

/**
 * Unit test assert
 *
 * @param name   the unique identifier for the test
 * @param test   the tested value
 * @param assume the assumed value
 */
module.exports.assert = function(name, test, assume)
{
	if (this.equals(test, assume)) {
		this.passed ++;
	}
	else {
		console.log('! ' + this.prefix + '.' + name + ' : ' + test + ' / ' + assume);
		this.errors ++;
	}
};

/**
 * Test if two values / objects are equal
 *
 * @param test
 * @param assume
 * @returns boolean
 */
module.exports.equals = function(test, assume)
{
	if (
		((typeof test) !== (typeof assume))
		|| ((test === null) && (assume !== null))
		|| ((test !== null) && (assume === null))
	) {
		return false;
	}
	if (typeof test === 'object') {
		for (var i in test) if (test.hasOwnProperty(i)) {
			if (!this.equals(test[i], assume[i])) {
				return false;
			}
		}
		for (i in assume) if (assume.hasOwnProperty(i)) {
			if (test[i] !== assume[i]) {
				return false;
			}
		}
	}
	else if (test !== assume) {
		return false;
	}
	return true;
};

/**
 * Run tests
 *
 * @return string '100%' if ok, '50%' if 5 of 10 tests pass, etc.
 */
module.exports.run = function()
{
	this.body();
	console.log((this.errors + this.passed) + ' tests - ' + this.passed + ' passed - ' + this.errors + ' errors');
	return Math.ceil(this.passed / (this.errors + this.passed) * 100) + '%';
};

//--------------------------------------------------------------------------------------------------------------- body

var body = require('body');

/**
 * Body unit tests
 */
module.exports.body = function()
{
	this.prefix = 'body.cost';
	this.assert('initial',       body.cost([CARRY, MOVE, WORK]), 200);
	this.assert('harvester',     body.cost([MOVE, WORK, WORK, WORK, WORK, WORK]), 550);
	this.assert('carrier.plain', body.cost([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]), 500);
	this.assert('carrier.road',  body.cost([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]), 500);
	this.prefix = 'body.parts';
	this.assert('initial',       body.parts([CARRY, MOVE, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('notEnough',     body.parts([CARRY, MOVE, WORK], 199), null);
	this.assert('reduce',        body.parts([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('equilibrium',   body.parts([CARRY, MOVE, MOVE, WORK, WORK, WORK, WORK], 300), [CARRY, MOVE, WORK, WORK]);
	this.assert('harvester',     body.parts([MOVE, WORK, WORK, WORK, WORK, WORK], 300), [MOVE, WORK, WORK]);
	this.assert('carrier.plain', body.parts([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 300), [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]);
	var body_parts = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
	this.assert('carrier.road',  body.parts(body_parts, 300), [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]);
	this.assert('noLoose',       body_parts, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]);
};
