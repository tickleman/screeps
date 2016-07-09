
var Creep   = require('creep');
var sources = require('sources');

var harvester = require('role.harvester.simple');
var upgrader  = require('role.upgrader.simple');

/**
 * The harvest phase :
 * - needs at least initialized sources (phase.start)
 * - spawn harvesters and upgraders until all the sources access terrains capacity is used
 * - harvesters work on sources and bring the energy back to the spawn
 * - upgraders work on sources and bring the energy to the room controller
 */
module.exports =
{

	run: function()
	{
		var count = { harvester: 0, upgrader: 0 };
		var creeps = _.filter(Game.creeps, creep =>
			creep.memory.role == 'harvester' || creep.memory.role == 'upgrader'
		);
		for (var name in creeps) {
			var creep = creeps[name];
			if (!Creep.fill(creep)) {
				if (creep.memory.role == 'harvester') harvester.run(creep);
				if (creep.memory.role == 'upgrader')  upgrader.run(creep);
			}
			count[creep.memory.role] ++;
		}
		if (count['harvester'] < Math.min(sources.terrainsCount(), 2)) {
			this.spawnHarvester();
		}
		else if (count['upgrader'] < (sources.terrainsCount() - count['harvester']) * 1.5) {
			this.spawnUpgrader();
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
			Creep.free();
		}
	},

	spawnUpgrader: function()
	{
		if (!Game.spawns.Spawn.canCreateCreep([CARRY, MOVE, WORK])) {
			var source_id = sources.availableSourceId();
			// no available source id ? they must be at least one affected to a dead creep : cleanup
			if (!source_id) {
				sources.memorize(true);
				source_id = sources.availableSourceId();
			}
			// spawn a new upgrader
			Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], undefined, {
				role: 'upgrader', source: source_id, target: Game.spawns.Spawn.room.controller.id
			});
			// cleanup memory (remove dead harvesters, add new harvester)
			sources.memorize(true);
			Creep.free();
		}
	}

};
