var Source = require('source');

module.exports =
{

	/**
	 * List all available sources
	 * List all accessible points to these sources (capacity)
	 *
	 * @param force boolean if set to true, refresh existing sources memory
	 */
	memorize: function(force)
	{
		if (force || !Memory.sources) {
			Memory.sources = {};
			for (var room_key in Game.rooms) {
				Game.rooms[room_key].find(FIND_SOURCES_ACTIVE).forEach(function (source) {
					Memory.sources[source.id] = new Source(source);
				});
			}
		}
	}

};
