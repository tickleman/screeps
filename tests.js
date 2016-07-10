/**
 * Unit tests
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
	this.creep();
	console.log((this.errors + this.passed) + ' tests - ' + this.passed + ' passed - ' + this.errors + ' errors');
	return Math.ceil(this.passed / (this.errors + this.passed) * 100) + '%';
};

//--------------------------------------------------------------------------------------------------------------- creep

var creep = require('creep');

/**
 * Creep unit tests
 */
module.exports.creep = function()
{
	this.prefix = 'creep.cost';
	this.assert('initial',       creep.cost([CARRY, MOVE, WORK]), 200);
	this.assert('harvester',     creep.cost([MOVE, WORK, WORK, WORK, WORK, WORK]), 550);
	this.assert('carrier.plain', creep.cost([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]), 500);
	this.assert('carrier.road',  creep.cost([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]), 500);
	this.prefix = 'creep.bodyParts';
	this.assert('initial',       creep.bodyParts([CARRY, MOVE, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('notEnough',     creep.bodyParts([CARRY, MOVE, WORK], 199), null);
	this.assert('reduce',        creep.bodyParts([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('equilibrium',   creep.bodyParts([CARRY, MOVE, MOVE, WORK, WORK, WORK, WORK], 300), [CARRY, MOVE, WORK, WORK]);
	this.assert('harvester',     creep.bodyParts([MOVE, WORK, WORK, WORK, WORK, WORK], 300), [MOVE, WORK, WORK]);
	this.assert('carrier.plain', creep.bodyParts([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 300), [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]);
	this.assert('carrier.road',  creep.bodyParts([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], 300), [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]);
};
