/**
 * Functions on Game.creeps
 */

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
	var count = {};
	for (let creep in Game.creeps) if (Game.creeps.hasOwnProperty(creep)) {
		creep = Game.creeps[creep];
		if (!count[creep.memory.role]) {
			count[creep.memory.role] = 0;
		}
		count[creep.memory.role] ++;
	}
	return count;
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
		callback.call(thisArg, Game.creeps[key], key, Game.creeps);
	}
};
