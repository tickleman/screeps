
var Source = require('./source');

/**
 * Affects a creep to the first available access terrain of its source
 *
 * @param creep Creep
 */
module.exports.affect = function(creep)
{
	var source = Memory.sources[creep.memory.source];
	for (let terrain of source.terrains) {
		if (!terrain.creeps) {
			console.log('creep ' + creep.name + ' in terrain ' + creep.memory.source + ' : ' + terrain.x + ',' + terrain.y);
			terrain.creeps = terrain.creeps ? (terrain.creeps + 1) : 1;
			break;
		}
	}
};

/**
 * @param return_last_source boolean
 * @return string|null the id of the first source with at least one available access terrain
 */
module.exports.availableSourceId = function(return_last_source)
{
	for (let source_id in Memory.sources) if (Memory.sources.hasOwnProperty(source_id)) {
		let source = Memory.sources[source_id];
		for (let terrain of source.terrains) {
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
		for (let room in Game.rooms) if (Game.rooms.hasOwnProperty(room)) {
			room = Game.rooms[room];
			for (let source of room.find(FIND_SOURCES_ACTIVE)) {
				Memory.sources[source.id] = new Source(source);
			}
		}
		// affects creeps
		for (let creep in Game.creeps) if (Game.creeps.hasOwnProperty(creep)) {
			creep = Game.creeps[creep];
			if (Memory.sources[creep.memory.source]) {
				this.affect(creep);
			}
		}
	}
};

/**
 * @return number The number of available terrains
 */
module.exports.terrainsCount = function()
{
	var terrains_count = 0;
	for (let source of Memory.sources) {
		terrains_count += source.terrains.length;
	}
	return terrains_count;
};
