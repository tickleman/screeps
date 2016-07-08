var sources = require('sources');

module.exports.run = function()
{
	if (!_.filter(Game.creeps).length) {
		sources.memorize(true);
		var closest_source = Game.spawns.Spawn.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
		var creep_name = Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], undefined, {
			role: 'harvester', source: closest_source, target: Game.spawns.Spawn.id
		});
		Memory.sources[closest_source].terrains[0].creep = Game.creeps[creep_name].id;
	}
	if (_.filter(Game.creeps).length) {
		Memory.phase = 'harvest';
	}
};
