/**
 * Functions on Game.creeps
 */

var rooms = require('./rooms');

module.exports =
{

	/**
	 * @returns number
	 */
	get length()
	{
		if (this.length_ == undefined) {
			this.length_ = Object.keys(Game.creeps).length;
		}
		return this.length_;
	}

};

/**
 * Count creeps per role
 *
 * @returns object { role: count }
 */
module.exports.count = function()
{
	if (this.cache) return this.cache;
	var count = {};
	for (let creep in Game.creeps) if (Game.creeps.hasOwnProperty(creep)) {
		creep = Game.creeps[creep];
		if (!count[creep.room.name]) count[creep.room.name] = {};
		if (!count[creep.room.name][creep.memory.role]) {
			count[creep.room.name][creep.memory.role] = 0;
		}
		count[creep.room.name][creep.memory.role] ++;
	}
	return this.cache = count;
};

/**
 * @param callback callable
 * @returns Creep[]
 */
module.exports.filter = function(callback)
{
	return _.filter(Game.creeps, callback);
};

/**
 * @param callback
 * @param [thisArg] object
 */
module.exports.forEach = function(callback, thisArg)
{
	if (thisArg == undefined) thisArg = this;
	for (var key in Game.creeps) if (Game.creeps.hasOwnProperty(key)) {
		if (callback.call(thisArg, Game.creeps[key], key, Game.creeps)) break;
	}
};

/**
 * Remove dead creeps from memory
 * Callback accepts one argument : the name of the dead creep
 *
 * @param callback
 * @param [dead_creep_free_memory] boolean if true, free memory from the dead creep
 */
module.exports.forEachDeadCreep = function(callback, dead_creep_free_memory)
{
	for (let creep_name in Memory.creeps) if (Memory.creeps.hasOwnProperty(creep_name)) {
		if (!Game.creeps[creep_name]) {
			if (callback.call(Memory.creeps[creep_name], creep_name)) break;
			if (dead_creep_free_memory) {
				delete Memory.creeps[creep_name];
			}
		}
	}
};

/**
 * Free memory for dead creeps :
 * - list dead creeps
 * - empty memory about this creep from Memory.rooms.<room>.<room_role>.creep
 * - empty memory about this creep from Memory.creeps
 * - empty memory about this creep from Game.flags.<flag>.memory.creep
 */
module.exports.freeDeadCreeps = function()
{
	this.forEachDeadCreep(function(creep_name) {
		if (this.room && this.room_role) {
			rooms.removeRoleCreep(this.room, this.room_role);
		}
		for (let flag in Game.flags) if (Game.flags.hasOwnProperty(flag)) {
			flag = Game.flags[flag];
			if (flag.memory.carrier   && (flag.memory.carrier   == creep_name)) delete flag.memory.carrier;
			if (flag.memory.harvester && (flag.memory.harvester == creep_name)) delete flag.memory.harvester;
		}
	}, true);
};
