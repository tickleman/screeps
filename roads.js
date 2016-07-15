/**
 * Prepare to build roads
 */

var Path = require('./path');
var Room = require('./room');

module.exports.build = function()
{
	// build roads for all paths having a waypoint (before the waypoint only)
	for (let source_id in Memory.room.paths) if (Memory.room.paths.hasOwnProperty(source_id)) {
		let paths = Memory.room.paths[source_id];
		for (let destination_id in paths) if (paths.hasOwnProperty(destination_id)) {
			let path = paths[destination_id];
			let i = path.indexOf(Path.WAYPOINT);
			if (i > -1) {
				this.buildRoad(path.unshift(path.substr(0, i)));
			}
		}
	}
};

/**
 * @param path string 'xxyy123'
 */
module.exports.buildRoad = function(path)
{
	for (let pos of Path.unserialize(path)) {
		console.log('build road at ' + pos.x + ', ' + pos.y);
		Room.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
	}
};
