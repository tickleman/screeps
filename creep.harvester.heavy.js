/**
 * The heavy harvester :
 * - goes (slowly) to a free source
 * - stays near it for its all its life
 * - it harvests the energy (10 / tick) and throw it on the ground
 */

module.exports.__proto__ = require('./creep.harvester');

/**
 * Body parts for a heavy harvester
 * MOVE, WORK x 5
 * - consume 550 energy units
 */
module.exports.body_parts = [MOVE, WORK, WORK, WORK, WORK, WORK];

/**
 * Never full : we never fill the heavy harvester : energy is thrown on the ground
 *
 * @return boolean false
 **/
module.exports.isFull = function()
{
	return false;
};

/**
 * This creep has no target
 *
 * @returns array []
 */
module.exports.targets = function()
{
	return [];
};
