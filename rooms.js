
/**
 * This is an iterable Game.rooms
 */
module.exports =
{

	/**
	 * @param callback callable
	 * @returns Creep[]
	 */
	filter: function(callback)
	{
		return _.filter(Game.rooms, callback);
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
		for (var key in Game.rooms) if (Game.rooms.hasOwnProperty(key)) {
			callback.call(thisArg, Game.rooms[key], key, this);
		}
	},

	/**
	 * @returns number
	 */
	get length()
	{
		if (this.length_ == undefined) {
			this.length_ = Object.keys(Game.rooms).length;
		}
		return this.length_;
	},

	/**
	 * Iterator
	 */
	[Symbol.iterator]()
	{
		let indexes = Object.keys(Game.rooms);
		let index = 0;
		return {
			next: function()
			{
				let value = Game.rooms[indexes[index]];
				let done = index >= indexes.length;
				index ++;
				return {value, done};
			}
		}
	}

};
