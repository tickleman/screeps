
/**
 * Unit test assert
 *
 * @param name   the unique identifier for the test
 * @param test   the tested value
 * @param assume the assumed value
 */
module.exports.assert = function(name, test, assume)
{
	if (!this.equals(test, assume)) {
		console.log(this.prefix + '.' + name + ' : ' + test + ' / ' + assume);
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
	if ((typeof test) !== (typeof assume)) {
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
 * Test prefix for display
 *
 * @type string
 */
module.exports.prefix = 'test';

//--------------------------------------------------------------------------------------------------------------- creep

var creep = require('creep.js');

/**
 * Body parts count unit test
 */
module.exports.bodyParts = function()
{
	this.prefix = 'creep.cost';
	this.assert('initial', creep.cost([CARRY, MOVE, WORK]), 200);
	this.assert('harvester', creep.cost([MOVE, WORK, WORK, WORK, WORK, WORK]), 550);
	this.assert('carrier.fast', creep.cost([CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]), 500);
	this.assert('carrier.road', creep.cost([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]), 500);
	this.prefix = 'creep.bodyParts';
	this.assert('initial',     creep.bodyParts(creep.bodyParts([CARRY, MOVE, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('notEnough',   creep.bodyParts([CARRY, MOVE, WORK], 199), null);
	this.assert('reduce',      creep.bodyParts([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK], 200), [CARRY, MOVE, WORK]);
	this.assert('equilibrium', creep.bodyParts([CARRY, MOVE, MOVE, WORK, WORK, WORK, WORK], 300), [CARRY, MOVE, WORK, WORK]);
};
