
// store terrain near sources into memory
// sources[id][x,y] = { terrain: lava|plain|swamp }
Memory.sources = {};
for (let room in Game.rooms) if (Game.rooms.hasOwnProperty(room)) {
	room = Game.rooms[room];
	for (let source of room.find(FIND_SOURCES_ACTIVE)) {
		Memory.sources[source.id] = [];
		for (let terrain of source.room.lookForAtArea(
			LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true
		)) {
			if (
				((terrain.x != source.pos.x) || (terrain.y != source.pos.y))
				&& ((terrain.terrain == 'plain') || (terrain.terrain == 'swamp'))
			) {
				Memory.sources[source.id].push({
					room: source.room.name, terrain: terrain.terrain, x: terrain.x, y: terrain.y
				});
			}
		}
	}
}
