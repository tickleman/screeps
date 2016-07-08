var Creep = require('creep');

var harvester = require('role.harvester.simple');
var sources   = require('sources');

module.exports =
{

	run: function()
	{
		var harvesters = _.filter(Game.creeps, { filter: creep => creep.role == 'harvester' });
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
		var source_id = sources.availableSourceId();
		var creep_name = Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], undefined, {
			role: 'harvester', source: source_id, target: Game.spawns.Spawn.id
		});
		if (Game.creeps[creep_name]) {
			sources.memorize(true);
		}
	}

};
