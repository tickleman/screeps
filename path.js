/**
 * Permanent path generator
 *
 * - calculate calculates the path from source to destination, with a distance of range to the destination
 * - calculateTwoWay calculates the path from source to destination, then back to source, using a different path
 *   to avoid creeps collisions
 * - you can use exclude to set positions (or simple {x, y} of terrain you don't want to cross
 *   this exclude list is modifie by calculateTwoWay (the first path is added to exclude)
 * - default is to ignore creeps, but you can set ignore_creeps to false
 *
 * Use :
 * require('path').calculate(Game.spawns.Spawn, Game.spawns.Spawn.room.controller, 2)
 * require('path').calculateTwoWay(Game.spawns.Spawn.pos.findClosestByRange(FIND_SOURCES_ACTIVE), Game.spawns.Spawn)
 *
 * Want to test ? This draw flags
 * require('path').flag().calculateTwoWay(Game.spawns.Spawn.pos.findClosestByRange(FIND_SOURCES_ACTIVE), Game.spawns.Spawn)
 * require('path').flag().calculateTwoWay(Game.spawns.Spawn.pos.findClosestByRange(FIND_SOURCES_ACTIVE), Game.spawns.Spawn.room.controller, 2)
 *
 * Cleanup test flags :
 * for (let flag of Game.spawns.Spawn.room.find(FIND_FLAGS)) if (!isNaN(flag.name)) flag.remove()
 */

/**
 * @type Array [{x, y}]
 */
module.exports.exclude = [];

/**
 * Valorized ways (eg future roads, etc.)
 *
 * @type object [cost: [{x, y}]]
 */
module.exports.valorize = [];

/**
 * @type boolean|string
 */
module.exports.flags = false;

/**
 * @type boolean
 */
module.exports.ignore_creeps = true;

/**
 * @type int
 */
module.exports.plain_cost = 2;

/**
 * @type int
 */
module.exports.road_cost = 1;

/**
 * @type int
 */
module.exports.swamp_cost = 10;

/**
 * @param source             object the source point
 * @param destination        object the destination point
 * @param [range]            number range from the destination @default 0
 * @param [cumulate_exclude] boolean if true, the new path will append to this.exclude
 * @return Array [{x, y}]
 **/
module.exports.calculate = function(source, destination, range, cumulate_exclude)
{
	var calculator = this;

	//noinspection JSUnusedGlobalSymbols Used by search()
	var path = PathFinder.search(
		source.pos ? source.pos : source,
		{ pos: destination.pos ? destination.pos : destination, range: range ? range : 0 },
		{
			plainCost: calculator.plain_cost,
			swampCost: calculator.swamp_cost,
			roomCallback: function(room_name) {
				var room = Game.rooms[room_name];
				if (!room) return;
				var costs = new PathFinder.CostMatrix;

				for (let structure of room.find(FIND_STRUCTURES)) {
					if (structure.structureType === STRUCTURE_ROAD) {
						costs.set(structure.pos.x, structure.pos.y, calculator.road_cost);
					}
					else if (
						(structure.structureType !== STRUCTURE_CONTAINER)
						&& ((structure.structureType !== STRUCTURE_RAMPART) || !structure.my)
					) {
						costs.set(structure.pos.x, structure.pos.y, 0xff);
					}
				}

				if (!calculator.ignore_creeps) {
					for (let creep of room.find(FIND_CREEPS)) {
						costs.set(creep.pos.x, creep.pos.y, 0xff);
					}
				}

				for (let pos of calculator.exclude) {
					costs.set(pos.x, pos.y, 0xff);
				}

				calculator.valorize.forEach(function(valorize, cost) {
					for (let pos of valorize) {
						costs.set(pos.x, pos.y, cost);
					}
				});

				return costs;
			}
		}
	);

	var result = [];
	for (let pos of path.path) {
		result.push({ x: pos.x, y: pos.y });
		if (cumulate_exclude) {
			this.exclude.push({ x: pos.x, y: pos.y });
		}
	}

	return result;
};

/**
 * @param source      object
 * @param destination object
 * @param [range]     number
 * @returns Array [{x, y}]
 */
module.exports.calculateTwoWay = function(source, destination, range)
{
	var exclude = this.exclude.slice(0);
	if (this.flags) {
		for (let flag of source.room.find(FIND_FLAGS)) {
			if (!isNaN(flag.name)) {
				flag.remove();
			}
		}
	}
	var path = this.calculate(source, destination, range + 1, true);
	var last = this.last(path);
	var back = destination.room.getPositionAt(last.x, last.y);
	path.push('step');
	path = path.concat(this.calculate(back, source, 1));
	if (this.flags) {
		var counter = 0;
		for (let pos of path) {
			if (pos != 'step') {
				source.room.createFlag(pos.x, pos.y, (++counter).toString());
				console.log(counter + ' : ' + pos.x + ', ' + pos.y);
			}
		}
	}
	this.exclude = exclude;
	return path;
};

/**
 * Returns the first position of the path
 *
 * @param path
 * @returns object {x, y}
 */
module.exports.first = function(path)
{
	//noinspection LoopStatementThatDoesntLoopJS
	for (let element of path) {
		return element;
	}
};

/**
 * Will draw flags (for debugging purpose)
 *
 * @param name string
 * @return object self
 */
module.exports.flag = function(name)
{
	this.flags = name ? name : true;
	return this;
};

/**
 * Returns the last position of the path
 *
 * @param path
 * @returns object {x, y}
 */
module.exports.last = function(path)
{
	//noinspection LoopStatementThatDoesntLoopJS
	for (let element of path.slice(-1)) {
		return element;
	}
};
