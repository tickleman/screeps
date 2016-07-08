var Source = require('source.js');

module.exports =
{

	/**
	 * List all available sources
	 * List all accessible points to these sources (capacity)
	 */
	memorize: function()
	{
		Memory.sources = {};
		for (var room_key in Game.rooms) {
			Game.rooms[room_key].find(FIND_SOURCES_ACTIVE).forEach(function(source) {
				Memory.sources[source.id] = new Source(source);
			});
		}
	}

};
