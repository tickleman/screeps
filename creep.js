
/**
 * Move to source / fill of energy
 *
 * @param creep Creep
 * @param reset_target boolean
 **/
module.exports.fill = function(creep, reset_target)
{
	if (!this.isFull(creep, reset_target)) {
		var source = Game.getObjectById(creep.memory.source);
		if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
			creep.moveTo(source);
		}
		return true;
	}
	return false;
};

/**
 * Free memory from dead creeps
 */
module.exports.freeMemory = function()
{
	for (var creep in Memory.creeps) {
		if (Memory.creeps[creep]._move && !Game.creeps[creep]) {
			delete Memory.creeps[creep];
			console.log('prune creep ' + creep);
		}
	}
};

/**
 * Returns true if the creep is full of energy
 * Store the full information into its memory
 *
 * @param creep Creep
 * @param reset_target boolean
 */
module.exports.isFull = function(creep, reset_target)
{
	if (creep.memory.full) {
		if (!creep.carry.energy) {
			creep.memory.full = false;
			if (reset_target) {
				delete creep.memory.target;
			}
		}
	}
	else if (creep.carry.energy == creep.carryCapacity) {
		creep.memory.full = true;
	}
	return creep.memory.full;
};
