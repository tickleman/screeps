
var Creep = require('creep');

var harvester = require('role.harvester.simple');
var sources   = require('sources');

/**
 * The harvest phase :
 * - needs at least initialized sources (phase.start)
 * - spawn harvesters until all the sources access terrains capacity is used
 * - harvesters work on sources and bring the energy back to the spawn
 */
module.exports =
{

	run: function()
	{
		var harvesters = _.filter(Game.creeps, creep => creep.memory.role == 'harvester' );
		if (harvesters.length < sources.terrainsCount()) {
			this.spawnHarvester();
		}
		for (var name in harvesters) {
			var creep = harvesters[name];
			if (!Creep.fill(creep)) {
				harvester.run(creep);
			}
		}
	},

	spawnHarvester: function()
	{
		if (!Game.spawns.Spawn.canCreateCreep([CARRY, MOVE, WORK])) {
			var source_id = sources.availableSourceId();
			// no available source id ? they must be at least one affected to a dead creep : cleanup
			if (!source_id) {
				sources.memorize(true);
				source_id = sources.availableSourceId();
			}
			// spawn a new harvester
			Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], undefined, {
				role: 'harvester', source: source_id, target: Game.spawns.Spawn.id
			});
			// cleanup memory (remove dead harvesters, add new harvester)
			sources.memorize(true);
		}
	}

};
