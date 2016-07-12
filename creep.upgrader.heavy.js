/**
 * The heavy upgrader :
 * - goes (slowly) to the room controller
 * - stays near it for its all its life
 * - it harvests the energy (10 / tick) and throw it on the ground
 */

module.exports.__proto__ = require('./creep.upgrader');

/**
 * Body parts for a heavy harvester
 * CARRY x 2, MOVE, WORK x 5
 * - consume 550 energy units
 */
module.exports.body_parts = [CARRY, CARRY, MOVE, WORK, WORK, WORK, WORK];

/**
 * Always full : we never fill the heavy upgrader : a carrier will bring him energy
 *
 * @return boolean true
 **/
module.exports.isFull = function()
{
	return true;
};

/**
 * This creep has no source
 *
 * @returns array []
 */
module.exports.sources = function()
{
	return [];
};
