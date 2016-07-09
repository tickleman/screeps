
var sources = require('sources');

/**
 * Initial start phase :
 * - create the first creep : a harvest that will work at the nearest source
 * - initialize sources and access terrains memory
 */
module.exports.run = function()
{
	if (Game.spawns.Spawn) {
		if (!_.filter(Game.creeps).length && !Game.spawns.Spawn.canCreateCreep([CARRY, MOVE, WORK])) {
			var closest_source = Game.spawns.Spawn.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
			Game.spawns.Spawn.createCreep([CARRY, MOVE, WORK], 'Dawn', {
				role: 'harvester', source: closest_source, target: Game.spawns.Spawn.id
			});
			sources.memorize(true);
		}
		Memory.phase = 'harvest';
	}
};
