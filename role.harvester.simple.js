/**
 * A very simple harvester :
 * - must be at least CARRY, MOVE, WORK
 * - must be associated to a source
 * - must be associated to a target
 *
 * It will go to the source, get energy, go to the target and transfer the energy, until it dies.
 * This is the first creep that starts the colony.
 */
module.exports =
{

	/**
	 * @param creep Creep
	 **/
	run: function(creep)
	{
		var target = Game.getObjectById(creep.memory.target);
		// transfer to structure
		if (target) {
			if (target.energy >= target.energyCapacity) {
				creep.memory.target = 0;
			}
			else if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}
		// find target
		else {
			var targets = this.targets(creep);
			if (targets.length) {
				creep.memory.target = targets[0].id;
			}
			else {
				creep.memory.target = 0;
				return false;
			}
		}
		return true;
	},

	/**
	 * @param creep Creep
	 **/
	targets: function(creep)
	{
		return creep.room.find(FIND_STRUCTURES, { filter: structure =>
			structure.energy < structure.energyCapacity && structure.structureType == STRUCTURE_SPAWN
		});
	}

};
