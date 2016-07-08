
// store terrain near sources into memory
// sources[id][x,y] = { terrain: lava|plain|swamp }
Memory.sources = {};
for (var room_key in Game.rooms) {
	Game.rooms[room_key].find(FIND_SOURCES_ACTIVE).forEach(function(source) {
		Memory.sources[source.id] = [];
		source.room.lookForAtArea(
			LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true
		).forEach(function(terrain) {
			if (
				((terrain.x != source.pos.x) || (terrain.y != source.pos.y))
				&& ((terrain.terrain == 'plain') || (terrain.terrain == 'swamp'))
			) {
				Memory.sources[source.id].push({
					room: source.room.name, terrain: terrain.terrain, x: terrain.x, y: terrain.y
				});
			}
		});
	});
}
