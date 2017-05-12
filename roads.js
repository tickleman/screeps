/**
 * Prepare to build roads
 */

let Path = require('./path');

module.exports.build = function()
{
	// build roads for all paths having a waypoint (before the waypoint only)
	for (let room_name in Memory.rooms) if (Memory.rooms.hasOwnProperty(room_name)) {
		let room_memory = Memory.rooms[room_name];
		for (let room_role in room_memory) if (room_memory.hasOwnProperty(room_role)) {
			let memory = room_memory[room_role];
			if (memory.path) {
				this.buildRoad(Game.rooms[room_name], memory.path.substr(0, memory.path.indexOf(Path.WAYPOINT)));
			}
		}
	}
};

/**
 * @param room Room
 * @param path string 'xxyy123'
 */
module.exports.buildRoad = function(room, path)
{
	for (let pos of Path.unserialize(path)) {
		room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
	}
};
