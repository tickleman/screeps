module.exports = function(creep, destination)
{

	var path = PathFinder.search(
		creep.pos,
		{ pos: destination.pos, range: 1 },
		{
			plainCost: 2,
			swampCost: 10,
			roomCallback: function(roomName) {
				let room = Game.rooms[roomName];
				if (!room) return;
				let costs = new PathFinder.CostMatrix;

				room.find(FIND_STRUCTURES).forEach(function(structure) {
					if (structure.structureType === STRUCTURE_ROAD) {
						costs.set(structure.pos.x, structure.pos.y, 1);
					}
					else if (
						structure.structureType !== STRUCTURE_CONTAINER
						&& (
							structure.structureType !== STRUCTURE_RAMPART
							|| !structure.my
						)
					) {
						costs.set(structure.pos.x, structure.pos.y, 0xff);
					}
				});

				room.find(FIND_CREEPS).forEach(function(creep) {
					costs.set(creep.pos.x, creep.pos.y, 0xff);
				});

				return costs;
			}
		}
	);

	var result = [];
	for (var key in path.path) {
		var pos = path.path[key];
		result.push(pos.x);
		result.push(pos.y);
	}
	return result;

};
