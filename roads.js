/**
 * Prepare to build roads
 */

var Path = require('./path');
var Room = require('./room');

module.exports.build = function()
{
	// build roads for all paths having a waypoint (before the waypoint only)
	for (let task in Memory.tasks) if (Memory.tasks.hasOwnProperty(task)) {
		task = Memory.tasks[task];
		if (task.role == 'carrier') {
			this.buildRoad(task.path.substr(0, task.path.indexOf(Path.WAYPOINT)));
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
