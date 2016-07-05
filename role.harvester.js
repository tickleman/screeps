module.exports =
{

	/** @param {Creep} creep **/
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

	/** @param {Creep} creep **/
	targets: function(creep)
	{
		var                 result = creep.room.find(FIND_STRUCTURES, { filter: structure => structure.energy < structure.energyCapacity && structure.structureType == STRUCTURE_EXTENSION });
		if (!result.length) result = creep.room.find(FIND_STRUCTURES, { filter: structure => structure.energy < structure.energyCapacity && structure.structureType == STRUCTURE_SPAWN });
		if (!result.length) result = creep.room.find(FIND_STRUCTURES, { filter: structure => structure.energy < structure.energyCapacity && structure.structureType == STRUCTURE_TOWER });
		return result;
	}

};
