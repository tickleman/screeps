
var Source = require('source');

/**
 * Affects a creep to the first available access terrain of its source
 *
 * @param creep Creep
 */
module.exports.affect = function(creep)
{
	var source = Memory.sources[creep.memory.source];
	for (var terrain in source.terrains) {
		terrain = source.terrains[terrain];
		if (!terrain.creeps) {
			console.log('creep ' + creep_name + ' in terrain ' + creep.memory.source + ' : ' + terrain.x + ',' + terrain.y);
			terrain.creeps = terrain.creeps ? (terrain.creeps + 1) : 1;
			break;
		}
	}
};

/**
 * @return string the id of the first source with at least one available access terrain
 */
module.exports.availableSourceId = function(return_last_source)
{
	for (var source_id in Memory.sources) {
		var source = Memory.sources[source_id];
		for (var terrain in source.terrains) {
			terrain = source.terrains[terrain];
			if (!terrain.creeps) {
				return source_id;
			}
		}
	}
	return return_last_source ? source_id : null;
};

/**
 * List all available sources
 * List all accessible points to these sources (capacity)
 * Affect existing creeps to their source access terrain
 *
 * @param force boolean if set to true, refresh existing sources memory
 */
module.exports.memorize = function(force)
{
	if (force || !Memory.sources) {
		// reset memory sources
		Memory.sources = {};
		for (var room_key in Game.rooms) {
			Game.rooms[room_key].find(FIND_SOURCES_ACTIVE).forEach(function (source) {
				Memory.sources[source.id] = new Source(source);
			});
		}
		// affects creeps
		for (var creep_name in Game.creeps) {
			var creep = Game.creeps[creep_name];
			if (Memory.sources[creep.memory.source]) {
				this.affect(creep);
			}
		}
	}
};

/**
 * @return integer The number of available terrains
 */
module.exports.terrainsCount = function()
{
	var terrains_count = 0;
	for (var source in Memory.sources) {
		terrains_count += Memory.sources[source].terrains.length;
	}
	return terrains_count;
};
