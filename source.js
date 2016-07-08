var Terrain = require('terrain');

const TERRAIN_PLAIN = 'plain';
const TERRAIN_SWAMP = 'swamp';

/**
 * @param source Source
 */
module.exports = function(source)
{

	/** @var id string */
	this.id = source.id;

	/** @var terrains Terrain[] */
	var terrains = [];
	source.room.lookForAtArea(
		LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true
	).forEach(function(terrain) {
		if (
			((terrain.x != source.pos.x) || (terrain.y != source.pos.y))
			&& ((terrain.terrain == TERRAIN_PLAIN) || (terrain.terrain == TERRAIN_SWAMP))
		) {
			terrains.push(new Terrain(source.room.name, terrain));
		}
	});
	this.terrains = terrains;

};

/**
 * Affects a creep to the first available access terrain
 *
 * @param creep string|Creep
 */
module.exports.prototype.affect = function(creep)
{
	for (var terrain in this.terrains) {
		terrain = this.terrains[terrain];
		if (!terrain.creep) {
			terrain.creep = (typeof creep == 'object') ? creep.id : creep;
			break;
		}
	}
};

/**
 * Returns available access terrains count
 *
 * @return integer
 */
module.exports.prototype.availableTerrainsCount = function()
{
	var available_terrains_count = 0;
	for (var terrain in this.terrains) {
		terrain = this.terrains[terrain];
		if (!terrain.creep) {
			available_terrains_count++;
		}
	}
};
