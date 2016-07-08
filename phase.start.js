var sources = require('sources');

module.exports.run = function()
{
	sources.memorize();
	var closest_source = Game.spawns.Spawn.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
	var creep = Game.spawns.Spawn.createCreep([WORK, CARRY, MOVE], undefined, {
		role: 'harvester', source: closest_source
	});
	Memory.sources[closest_source][0].creep = creep.id;
	Memory.phase = 'harvest';
};
