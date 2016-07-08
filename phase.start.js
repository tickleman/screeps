var sources = require('sources');

module.exports.run = function()
{
	sources.memorize();
	var closest_source = Game.spawns.Spawn.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
	var creep_name = Game.spawns.Spawn.createCreep([WORK, CARRY, MOVE], undefined, {
		role: 'harvester', source: closest_source
	});
	Memory.sources[closest_source].terrains[0].creep = Game.creeps[creep_name].id;
	Memory.phase = 'harvest';
};
