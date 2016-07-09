
var Creep   = require('creep');
var Sources = require('sources');

module.exports =
{

	spawn: function(role, target)
	{
		if (!Game.spawns.Spawn.canCreateCreep([CARRY, MOVE, WORK])) {
			var source = sources.availableSourceId();
			// no available source id ? they must be at least one affected to a dead creep : cleanup
			if (!source) {
				Sources.memorize(true);
				source = Sources.availableSourceId(true);
			}
			// spawn a new harvester
			Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], undefined, {
				role:   role ? role : 'harvester',
				source: source,
				target: target ? target : Game.spawns.Spawn.id
			});
			// cleanup memory (remove dead harvesters, add new harvester)
			Sources.memorize(true);
			Creep.free();
		}
	}

};
