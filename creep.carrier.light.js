
module.exports.__proto__ = require('creep');

/**
 * Body parts for a light carrier
 * CARRY x 3, MOVE x4, consumes 550 energy units
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];

/**
 * Light carrier spawner
 */
module.exports.spawn = function()
{
	return harvester.spawn('carrier', null);
};

/**
 * The carrier fills itself with energy put by heavy harvesters on the ground
 *
 * @param creep Creep
 */
module.exports.fill = function(creep)
{
	if (!this.isFull(creep, true)) {
		var source = Game.getObjectById(creep.memory.source);
		if (!source) {
			source = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
			if (source) {
				creep.memory.source = source.id;
			}
			else {
				delete creep.memory.source;
			}
		}
		if (source) {
			if (creep.pickup(source) == ERR_NOT_IN_RANGE) {
				creep.moveTo(source);
			}
			return true;
		}
	}
	return false;
};

/**
 * @param creep Creep
 **/
module.exports.work = function(creep)
{
	if (!this.fill(creep)) {
		var controller = Game.getObjectById(creep.memory.target);
		if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(controller);
		}
	}
};
