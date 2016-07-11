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
 * Game.spawns.Spawn.room.find(FIND_FLAGS).forEach(flag => !isNaN(flag.name) ? flag.remove() : null);
 */

/**
 * @type Array [{x, y}]
 */
module.exports.exclude = [];

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
 * @param source           object the source point
 * @param destination      object the destination point
 * @param range            int range from the destination @default 0
 * @param cumulate_exclude boolean if true, this.exclude will get the new path
 * @return array [{x, y}]
 **/
module.exports.calculate = function(source, destination, range, cumulate_exclude)
{
	var calculator = this;

	var path = PathFinder.search(
		source.pos ? source.pos : source,
		{ pos: destination.pos ? destination.pos : destination, range: range ? range : 0 },
		{
			plainCost: calculator.plain_cost,
			swampCost: calculator.swamp_cost,
			roomCallback: function(room_name) {
				let room = Game.rooms[room_name];
				if (!room) return;
				let costs = new PathFinder.CostMatrix;

				room.find(FIND_STRUCTURES).forEach(function(structure) {
					if (structure.structureType === STRUCTURE_ROAD) {
						costs.set(structure.pos.x, structure.pos.y, calculator.road_cost);
					}
					else if (
						(structure.structureType !== STRUCTURE_CONTAINER)
						&& ((structure.structureType !== STRUCTURE_RAMPART) || !structure.my)
					) {
						costs.set(structure.pos.x, structure.pos.y, 0xff);
					}
				});

				if (!calculator.ignore_creeps) {
					room.find(FIND_CREEPS).forEach(function (creep) {
						costs.set(creep.pos.x, creep.pos.y, 0xff);
					});
				}

				for (let key in calculator.exclude) if (calculator.exclude.hasOwnProperty(key)) {
					var pos = calculator.exclude[key];
					costs.set(pos.x, pos.y, 0xff);
				}

				return costs;
			}
		}
	);

	var result = [];
	for (var key in path.path) if (path.path.hasOwnProperty(key)) {
		var pos = path.path[key];
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
 * @param range       int
 * @returns array [{x, y}]
 */
module.exports.calculateTwoWay = function(source, destination, range)
{
	if (this.flags) {
		source.room.find(FIND_FLAGS).forEach(function(flag) {
			if (!isNaN(flag.name)) {
				flag.remove();
			}
		});
	}
	var path = this.calculate(source, destination, range + 1, true);
	var keys = Object.keys(path);
	var pos  = path[keys[keys.length - 1 ]];
	var back = destination.room.getPositionAt(pos.x, pos.y);
	path.push('step');
	path = path.concat(this.calculate(back, source, 1));
	if (this.flags) {
		var counter = 0;
		for (var key in path) if (path.hasOwnProperty(key)) {
			pos = path[key];
			if (pos != 'step') {
				source.room.createFlag(pos.x, pos.y, ++counter);
				console.log(counter + ' : ' + pos.x + ', ' + pos.y);
			}
		}
	}
	return path;
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
