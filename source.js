
var Terrain = require('source.terrain');

const TERRAIN_PLAIN = 'plain';
const TERRAIN_SWAMP = 'swamp';

/**
 * @param source Source
 */
module.exports = function(source)
{

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
