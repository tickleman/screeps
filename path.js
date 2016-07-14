/**
 * Path generator
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
 * @type string
 */
module.exports.WAYPOINT = 'w';

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
 * @type number
 */
module.exports.plain_cost = 2;

/**
 * @type number
 */
module.exports.road_cost = 1;

/**
 * @type number
 */
module.exports.swamp_cost = 10;

/**
 * @param source             object the source point
 * @param destination        object the destination point
 * @param [range]            number range from the destination @default 0
 * @param [cumulate_exclude] boolean if true, the new path will append to this.exclude
 * @return string xxyy123s456... where xx and yy are the start coordinates and 123 are the moves and w a waypoint
 * each move is a BOTTOM, LEFT, RIGHT, TOP constant value
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

	var result = this.serialize(source.pos);
	var last_pos = source.pos;
	for (let pos of path.path) {
		result += this.direction(last_pos, pos);
		if (cumulate_exclude) {
			this.exclude.push(pos);
		}
		last_pos = pos;
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
 * Calculates the direction from the position from to the position to
 *
 * @param from object {x, y}
 * @param to   object {x, y}
 */
module.exports.direction = function(from, to)
{
	if (to.x < from.x) {
		if      (to.y < from.y) return TOP_LEFT;
		else if (to.y > from.y) return BOTTOM_LEFT;
		else                    return LEFT;
	}
	else if (to.x > from.x) {
		if      (to.y < from.y) return TOP_RIGHT;
		else if (to.y > from.y) return BOTTOM_RIGHT;
		else                    return RIGHT;
	}
	else {
		if      (to.y < from.y) return TOP;
		else if (to.y > from.y) return BOTTOM;
	}
	return '';
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
 * Returns the last step of the path (arrival point)
 *
 * @param path @example 'xxyy123w456'
 * @returns object {x, y}
 */
module.exports.last = function(path)
{
	return this.step(path, this.length(path));
};

/**
 * Returns the length of the path : number of steps in it
 * - the first position is not counted as a step
 * - each move is considered as a step
 * - waypoints 'w' are considered as steps too
 *
 * @param path string @example 'xxyy123w456'
 * @return number
 */
module.exports.length = function(path)
{
	return path.substr(4).length;
};

/**
 * Returns the destination after move from source to direction
 *
 * @param source    object {x, y}
 * @param direction number a direction constant value
 * @return object {x, y}
 */
module.exports.move = function(source, direction)
{
	switch (direction) {
		case TOP_LEFT:     return {x: source.x - 1, y: source.y - 1};
		case BOTTOM_LEFT:  return {x: source.x - 1, y: source.y + 1};
		case LEFT:         return {x: source.x - 1, y: source.y};
		case TOP_RIGHT:    return {x: source.x + 1, y: source.y - 1};
		case BOTTOM_RIGHT: return {x: source.x + 1, y: source.y + 1};
		case RIGHT:        return {x: source.x + 1, y: source.y};
		case TOP:          return {x: source.x, y: source.y - 1};
		case BOTTOM:       return {x: source.x, y: source.y + 1};
	}
	return source;
};

/**
 * Removes the last step from the path
 *
 * @param path string
 * @return string
 */
module.exports.pop = function(path)
{
	return path.substr(0, Math.max(4, path.length - 1));
};

/**
 *
 * @param pos object {x, y}
 * @return string 'xxyy'
 */
module.exports.serialize = function(pos)
{
	var xx = pos.x.toString();
	if (xx.length < 2) xx = '0' + xx;
	var yy = pos.y.toString();
	if (yy.length < 2) yy = '0' + yy;
	return xx + yy;
};

/**
 * Returns the first step of the path (position or WAYPOINT)
 *
 * @param path @example 'xxyy123w456'
 * @returns object {x, y}
 */
module.exports.start = function(path)
{
	return {x: Number(path.substr(0, 2)), y: Number(path.substr(2, 2))};
};

/**
 * Extracts the position at the given step, or WAYPOINT if the step is a waypoint
 *
 * @param path       string @example 'xxyy123w456'
 * @param step       number
 * @param [position] boolean if true, will not return WAYPOINT but the last position at this step
 * @return object|number {x, y} or this.WAYPOINT
 */
module.exports.step = function(path, step, position)
{
	if (!position && ((path.substr(3 + step, 1) == this.WAYPOINT))) {
		return this.WAYPOINT;
	}
	var pos = this.start(path);
	var i = 4;
	while (step) {
		pos = this.move(pos, Number(path.substr(i, 1)));
		i ++;
		step --;
	}
	return pos;
};

/**
 * Removes the first step from the path
 *
 * @param path string
 * @returns string
 */
module.exports.unshift = function(path)
{
	var start = this.start(path);
	var direction = path.substr(4, 1);
	return this.serialize(this.move(start, direction)). path.substr(5);
};
