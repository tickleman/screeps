
/**
 * This is an iterable Game.creeps
 */
module.exports =
{

	/**
	 * @param callback callable
	 * @returns Creep[]
	 */
	filter: function(callback)
	{
		return _.filter(Game.creeps, callback);
	},

	/**
	 * @param callback
	 * @param [thisArg] object
	 */
	forEach: function(callback, thisArg)
	{
		if (thisArg == undefined) {
			thisArg = this;
		}
		for (var key in Game.creeps) if (Game.creeps.hasOwnProperty(key)) {
			callback.call(thisArg, Game.creeps[key], key, this);
		}
	},

	/**
	 * @returns number
	 */
	get length()
	{
		if (this.length_ == undefined) {
			this.length_ = Object.keys(Game.creeps).length;
		}
		return this.length_;
	},

	/**
	 * Iterator
	 */
	[Symbol.iterator]()
	{
		let indexes = Object.keys(Game.creeps);
		let index = 0;
		return {
			next: function()
			{
				let value = Game.creeps[indexes[index]];
				let done = index >= indexes.length;
				index ++;
				return {value, done};
			}
		}
	}

};
