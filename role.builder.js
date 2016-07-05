module.exports =
{

	/** @param {Creep} creep **/
	run: function(creep)
	{
		var target = Game.getObjectById(creep.memory.target);
		// build
		if (target) {
			if (creep.build(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}
		// find target
		else {
			var targets = this.targets(creep);
			if (!targets.length) {
				targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			}
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
		return creep.room.find(FIND_CONSTRUCTION_SITES, { filter: structure => structure.id != '-' });
	}

};
