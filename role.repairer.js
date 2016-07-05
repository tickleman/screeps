module.exports =
{

	/**
	 * @param creep Creep
	 **/
	run: function(creep)
	{
		var target = Game.getObjectById(creep.memory.target);
		if (target) {
			// repaired
			if (target.hits >= target.hitsMax) {
				creep.memory.target = 0;
			}
			// repair
			else if (creep.repair(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}
		// find target
		else {
			var targets = this.targets(creep);
			if (targets.length) {
				var target = targets[0];
				for (var n in targets) {
					if (targets[n].hits < target.hits) {
						target = targets[n];
					}
				}
				creep.memory.target = target.id;
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
		return creep.room.find(FIND_STRUCTURES, {
			filter: structure => structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_WALL
		});
	}

};
