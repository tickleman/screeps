/**
 * The fast carrier :
 * - is as fast as it can (outside of swamps)
 * - goes to energy dropped on the ground by heavy harvesters
 * - bring this energy to the spawn
 */

module.exports.__proto__ = require('creep');

/**
 * Body parts for a fast carrier
 * CARRY x 6, MOVE x5, consumes 550 energy units, moves 250 energy / tick
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];

/**
 * Its role : specialized in energy transportation
 */
module.exports.role = 'carrier';

/**
 * The carrier source work is to pickup the dropped energy
 *
 * @param creep Creep
 */
module.exports.sourceJob = function(creep)
{
	return creep.pickup(source);
};

/**
 * The carrier source is the nearest dropped energy
 *
 * @param creep Creep optional
 */
module.exports.sources = function(creep)
{
	var position = creep ? creep.pos : Game.spawns.Spawn.pos;
	var source = position.findClosestByRange(FIND_DROPPED_ENERGY);
	return (source ? [source] : []);
};
