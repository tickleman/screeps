
module.exports = require('harvester');

/**
 * A very simple harvester :
 * - must have at least CARRY, MOVE, WORK body parts
 * - must be associated to a source
 *
 * It will go to the source, get energy, go to the target and transfer the energy, until it dies.
 * This is the first creep that starts the colony.
 */

/**
 * @param creep Creep
 **/
module.exports.run = function(creep)
{
	var target = Game.getObjectById(creep.memory.target);
	// transfer to structure
	if (target) {
		if (target.energy >= target.energyCapacity) {
			delete creep.memory.target;
		}
		else if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			creep.moveTo(target);
		}
	}
	// find target
	else {
		var targets = this.targets(creep);
		if (targets.length) creep.memory.target = targets[0].id;
		else delete creep.memory.target;
	}
};

/**
 * @param creep Creep
 **/
module.exports.targets = function(creep)
{
	return creep.room.find(FIND_STRUCTURES, { filter: structure =>
		structure.energy < structure.energyCapacity
		&& structure.structureType == STRUCTURE_SPAWN
	});
};
