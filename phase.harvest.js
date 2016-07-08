var Creep = require('creep');

var harvester = require('role.harvester.simple');
var sources   = require('sources');

module.exports =
{

	run: function()
	{
		var harvesters = _.filter(Game.creeps, { filter: creep => creep.memory.role == 'harvester' });
		if (harvesters.length < sources.availableTerrainsCount()) {
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
			Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], undefined, {
				role: 'harvester', source: source_id, target: Game.spawns.Spawn.id
			});
			sources.memorize(true);
		}
	}

};
