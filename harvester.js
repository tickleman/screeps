
module.exports =
{

	spawn: function(role, target)
	{
		if (!Game.spawns.Spawn.canCreateCreep([CARRY, MOVE, WORK])) {
			var source_id = sources.availableSourceId();
			// no available source id ? they must be at least one affected to a dead creep : cleanup
			if (!source_id) {
				sources.memorize(true);
				source_id = sources.availableSourceId(true);
			}
			// spawn a new harvester
			Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], undefined, {
				role:   role ? role : 'harvester',
				source: source_id,
				target: target ? target : Game.spawns.Spawn.id
			});
			// cleanup memory (remove dead harvesters, add new harvester)
			sources.memorize(true);
			Creep.free();
		}
	}

};
