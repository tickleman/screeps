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
 * Want to test ? This draw flags :
 * - a creep goes from the spawn to the source, in order to stay here
 * require('path').flags(require('path').calculate(Game.spawns[constants.spawn], Game.spawns[constants.spawn].pos.findClosestByRange(FIND_SOURCES_ACTIVE), 1))
 * - a creep goes from a source to the spawn, then back
 * require('path').flags(require('path').calculateTwoWay(Game.spawns[constants.spawn].pos.findClosestByRange(FIND_SOURCES_ACTIVE), Game.spawns[constants.spawn], 1))
 * - a creep goes from a source to the upgrader, then back
 * require('path').flags(require('path').calculateTwoWay(Game.spawns[constants.spawn].pos.findClosestByRange(FIND_SOURCES_ACTIVE), Game.spawns[constants.spawn].room.controller, 3))
 *
 * Cleanup test flags :
 * require('path').clearFlags()
 */

let constants = require('./constants');
 
/**
 * @type number
 */
module.exports.ARRIVED = 1;

/**
 * @type boolean
 */
module.exports.DEBUG = false;

/**
 * @type string
 */
module.exports.WAYPOINT = 'w';

/**
 * @type Array [{x, y}]
 */
module.exports.exclude = [];

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
 * @type Room
 */
module.exports.room = Game.spawns[constants.spawn].room;

/**
 * Source range default is 1. May be 0 (others won't work)
 *
 * @type number
 */
module.exports.source_range = 1;

/**
 * @type number
 */
module.exports.swamp_cost = 10;

/**
 * Valorized ways (eg future roads, etc.)
 *
 * @type object [cost: [{x, y}]]
 */
module.exports.valorize = [];

/**
 * If source is a Creep, will memorize the path for the creep to allow .move calls :
 * - creep.memory.path
 * - creep.memory.path_step
 *
 * @param source             RoomObject|RoomPosition the source point
 * @param destination        RoomObject|RoomPosition the destination point
 * @param [opts]             {{ [accumulate_exclude]: boolean, [caption]: string, [exclude]: Array, [plain_cost]: number, [range]: number }}
 *        accumulate_exclude :  boolean if true, the new path will append to this.exclude
 *        caption : if set, this caption is displayed to the console when in debug mode : 'calculate : caption'
 *        range : number range from the destination @default 0
 * @return string 'xxyy123' where xx and yy are the start coordinates and 123 are the moves
 **/
module.exports.calculate = function(source, destination, opts)
{
	let source_creep;
	if (source instanceof Creep)           source_creep       = source;
	if (source instanceof RoomObject)      source             = source.pos;
	if (destination instanceof RoomObject) destination        = destination.pos;
	if (!opts)                             opts               = {};
	if (opts.exclude       === undefined)  opts.exclude       = this.exclude;
	if (opts.plain_cost    === undefined)  opts.plain_cost    = this.plain_cost;
	if (opts.range         === undefined)  opts.range         = 0;
	if (opts.road_cost     === undefined)  opts.road_cost     = this.road_cost;
	if (opts.source_range  === undefined)  opts.source_range  = this.source_range;
	if (opts.swamp_cost    === undefined)  opts.swamp_cost    = this.swamp_cost;
	if (opts.valorize      === undefined)  opts.valorize      = this.valorize;
	if (opts.ignore_creeps === undefined)  opts.ignore_creeps = this.ignore_creeps;
	if (opts.DEBUG         === undefined)  opts.DEBUG         = this.DEBUG;
	if (opts.DEBUG && opts.caption) console.log('calculate : ' + opts.caption);
	if (opts.DEBUG) console.log('calculate.source = ' + source.x + ', ' + source.y);
	if (opts.DEBUG) console.log('calculate.destination = ' + destination.x + ', ' + destination.y);
	if (opts.DEBUG) console.log('calculate.range = ' + opts.range);
	//noinspection JSUnusedGlobalSymbols Used by search()
	let path = PathFinder.search(
		source,
		{ pos: destination, range: opts.range },
		{
			plainCost: opts.plain_cost,
			swampCost: opts.swamp_cost,
			roomCallback: function(room_name) {
				let room = Game.rooms[room_name];
				if (!room) return;
				let costs = new PathFinder.CostMatrix;

				for (let structure of room.find(FIND_STRUCTURES)) {
					if (structure.structureType === STRUCTURE_ROAD) {
						costs.set(structure.pos.x, structure.pos.y, opts.road_cost);
					}
					else if (
						(structure.structureType !== STRUCTURE_CONTAINER)
						&& ((structure.structureType !== STRUCTURE_RAMPART) || !structure.my)
					) {
						costs.set(structure.pos.x, structure.pos.y, 0xff);
					}
				}

				for (let construction_site of room.find(FIND_CONSTRUCTION_SITES)) {
					if (
						(construction_site.structureType !== STRUCTURE_ROAD)
						&& (construction_site.structureType !== STRUCTURE_RAMPART)
					) {
						costs.set(construction_site.pos.x, construction_site.pos.y, 0xff);
					}
				}

				if (!opts.ignore_creeps) {
					for (let creep of room.find(FIND_CREEPS)) {
						costs.set(creep.pos.x, creep.pos.y, 0xff);
					}
				}

				opts.valorize.forEach(function(valorize, cost) {
					for (let pos of valorize) {
						costs.set(pos.x, pos.y, cost);
					}
				});

				for (let pos of opts.exclude) {
					if (opts.DEBUG) console.log('~ ' + pos.x + ', ' + pos.y);
					costs.set(pos.x, pos.y, 0xff);
				}

				return costs;
			}
		}
	);

	path = this.serialize(path.path.length ? path.path : [source], opts);
	if (!opts.source_range) {
		path = this.shift(path, source);
	}
	else if (opts.source_range > 1) {
		path = this.unshift(path, opts.source_range - 1);
	}
	if (source_creep) {
		source_creep.memory.path      = path;
		delete source_creep.memory.path_step;
	}
	return path;
};

/**
 * @param source      object
 * @param destination object
 * @param opts        {{ [accumulate_exclude]: boolean, [caption]: string, [exclude]: Array, [range]: number }}
 * @returns string @example 'xx123w456'
 */
module.exports.calculateTwoWay = function(source, destination, opts)
{
	if (source.pos)               source      = source.pos;
	if (destination.pos)          destination = destination.pos;
	if (!opts)                    opts        = {};
	if (opts.DEBUG === undefined) opts.DEBUG  = this.DEBUG;
	if (opts.DEBUG && opts.caption) console.log('calculateTwoWay : ' + opts.caption);
	if (opts.DEBUG) console.log('source = ' + source.x + ', ' + source.y);
	if (opts.DEBUG) console.log('destination = ' + destination.x + ', ' + destination.y);
	if (opts.DEBUG) console.log('range = ' + opts.range);

	// calculate path
	let accumulate_exclude = opts.accumulate_exclude;
	opts.accumulate_exclude = true;
	let path = this.calculate(source, destination, opts);
	opts.accumulate_exclude = accumulate_exclude;

	// prepare back path limits
	let back_source      = this.last(path);
	let back_destination = this.start(path);
	back_source      = this.toRoomPosition(back_source);
	back_destination = this.toRoomPosition(back_destination);
	opts.exclude.pop();
	if (opts.DEBUG) console.log('back_source = '      + back_source.x      + ', ' + back_source.y);
	if (opts.DEBUG) console.log('back_destination = ' + back_destination.x + ', ' + back_destination.y);

	// calculate return
	let range        = opts.range;
	let source_range = opts.source_range;
	opts.range        = 0;
	opts.source_range = 1;
	let back_path = this.calculate(back_source, back_destination, opts);
	opts.range        = range;
	opts.source_range = source_range;

	// concat paths
	path = path.concat(this.WAYPOINT, this.shift(back_path, back_source).substr(4));
	return path;
};

/**
 * Clear flags
 *
 * @param [after] number
 */
module.exports.clearFlags = function(after)
{
	if (!after) after = -1;
	if (this.flags) {
		for (let room of Game.rooms) {
			for (let flag of room.find(FIND_FLAGS)) {
				if (!isNaN(flag.name) && (Number(flag.name) > after)) {
					flag.remove();
				}
			}
		}
	}
};

/**
 * Set new costs (default if no value).
 * Returns the old costs.
 *
 * @param road  number|{{road: number, plain: number, swamp: number}}
 * @param plain number
 * @param swamp number
 * @returns {{road: number, plain: number, swamp: number}} old cost
 */
module.exports.cost = function(road, plain, swamp)
{
	let old_cost = { road: this.road_cost, plain: this.plain_cost, swamp: this.swamp_cost };
	if (typeof road === 'object') {
		this.road_cost  = (road.road  === undefined) ?  1 : road.road;
		this.plain_cost = (road.plain === undefined) ?  2 : road.plain;
		this.swamp_cost = (road.swamp === undefined) ? 10 : road.swamp;
	}
	else {
		this.road_cost  = (road  === undefined) ?  1 : road;
		this.plain_cost = (plain === undefined) ?  2 : plain;
		this.swamp_cost = (swamp === undefined) ? 10 : swamp;
	}
	return old_cost;
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
 * Returns the direction as text (useful for debugging purpose)
 *
 * @param direction number a direction constant value
 * @return string
 */
module.exports.directionString = function(direction)
{
	switch (direction) {
		case TOP_LEFT:     return 'top-left';
		case BOTTOM_LEFT:  return 'bottom-left';
		case LEFT:         return 'left';
		case TOP_RIGHT:    return 'top-right';
		case BOTTOM_RIGHT: return 'bottom-right';
		case RIGHT:        return 'right';
		case TOP:          return 'top';
		case BOTTOM:       return 'bottom';
	}
	return '';
};

/**
 * Will draw flags (for debugging purpose)
 *
 * @param path string 'xxyy123w456'
 * @return object self
 */
module.exports.flags = function(path)
{
	let counter = 0;
	for (let pos of this.unserialize(path)) {
		if (pos === this.WAYPOINT) {
			console.log('waypoint');
		}
		else {
			counter ++;
			if (Game.flags[counter.toString()]) {
				Game.flags[counter.toString()].setPosition(pos.x, pos.y);
			}
			else {
				this.room.createFlag(pos.x, pos.y, counter.toString());
			}
			console.log('flag ' + counter + ' : ' + pos.x + ', ' + pos.y);
		}
	}
	this.clearFlags(counter);
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
 * Returns the last position of the path (arrival position) as a RoomPosition
 *
 * @param path @example 'xxyy123x456'
 * @returns RoomPosition
 */
module.exports.lastRoomPosition = function(path)
{
	return this.toRoomPosition(this.last(path));
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
 * Move creep following the path
 *
 * @example : require('path').moveCreep(creep, )
 * @param creep  Creep
 * @param [path] string if not set, will use creep.memory.path
 * @param [step] number if not set, will use and increment creep.memory.path_step
 * @returns number|string 0 if moved, ARRIVED or WAYPOINT if arrived (before or after moving), error code if not moved
 */
module.exports.move = function(creep, path, step)
{
	let increment_step = !step;
	if (!path) path = creep.memory.path;
	if (!step) step = creep.memory.path_step;

	// if increment step
	if (increment_step) {
		// first move
		if (!step) {
			creep.memory.path_step = 4;
			step = 4;
		}
		// increment step if the last move was done
		else {
			let next_pos = this.step(path, step - 3, true);
			if (!(next_pos.x - creep.pos.x) && !(next_pos.y - creep.pos.y)) {
				if (this.DEBUG) console.log(next_pos.x, '-', creep.pos.x, 'and', next_pos.x, '-', creep.pos.x);
				creep.memory.path_step ++;
				step ++;
			}
			else {
				if (this.DEBUG) console.log(creep.name, creep.pos, '/', next_pos.x, ',', next_pos.y);
				creep.say('no move');
			}
		}
	}

	// arrived / waypoint
	if (step >= path.length)          return this.ARRIVED;
	if (path[step] === this.WAYPOINT) return this.WAYPOINT;

	// move
	return creep.move(path[step]);
};

/**
 * Returns the destination after move from source to direction
 *
 * @param source    object {x, y}
 * @param direction number a direction constant value
 * @return object {x, y}
 */
module.exports.movePos = function(source, direction)
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
 * @param path    string
 * @param [count] number @default 1
 * @return string
 */
module.exports.pop = function(path, count)
{
	if (!count) count = 1;
	return path.substr(0, Math.max(4, path.length - count));
};

/**
 * Returns a new path with a new pushed position
 * The position must be one of the 8 positions near the existing path last position
 * The pushed position may be :
 * - this.WAYPOINT
 * - a new starting point
 *
 * @param path string
 * @param pos  object|string|number {x, y}|this.WAYPOINT|direction
 */
module.exports.push = function(path, pos)
{
	if (pos === this.WAYPOINT) {
		return path.concat(this.WAYPOINT);
	}
	else {
		return path.concat(this.direction(this.last(path), pos));
	}
};

/**
 *
 * @param path   object[] [{x, y}]
 * @param [opts] {{ accumulate_exclude: boolean, exclude: Array }}
 * @return string 'xxyy123'
 */
module.exports.serialize = function(path, opts)
{
	if (!opts) opts = {};
	if (opts.DEBUG === undefined) opts.DEBUG = this.DEBUG;
	if (opts.accumulate_exclude && !opts.exclude) opts.exclude = [];
	let pos = path[Object.keys(path)[0]];
	if (opts.DEBUG) console.log('SERIALIZE');

	let xx = pos.x.toString();
	if (xx.length < 2) xx = '0' + xx;
	let yy = pos.y.toString();
	if (yy.length < 2) yy = '0' + yy;
	let result = xx.concat(yy);

	let last_pos = pos;
	if (opts.DEBUG) console.log('+ ' + pos.x + ', ' + pos.y + ' = ' + result);
	for (pos of path.slice(1)) {
		if (pos === this.WAYPOINT) {
			result = result.concat(pos);
			if (opts.DEBUG) console.log('+ ' + pos.x + ', ' + pos.y + ' = ' + this.WAYPOINT);
		}
		else {
			if (opts.accumulate_exclude) {
				opts.exclude.push(pos);
			}
			result = result.concat(this.direction(last_pos, pos));
			if (opts.DEBUG) console.log('+ ' + pos.x + ', ' + pos.y + ' = ' + this.direction(last_pos, pos));
			last_pos = pos;
		}
	}

	if (opts.DEBUG) console.log('SERIALIZE = ' + result);
	return result;
};

/**
 * Returns a new path with a new shifted start point
 * The position must be one of the 8 positions near the existing path start position
 * The shifted position may be :
 * - this.WAYPOINT
 * - a new starting point
 *
 * @param path string
 * @param pos  object|string|number {x, y}|this.WAYPOINT|direction
 */
module.exports.shift = function(path, pos)
{
	if (pos === this.WAYPOINT) {
		return path.substr(0, 4).concat(this.WAYPOINT, path.substr(4));
	}
	return this.serialize([pos]).concat(this.direction(pos, this.start(path)), path.substr(4));
};

/**
 * Returns the first step of the path
 *
 * @param path @example 'xxyy123w456'
 * @returns object {x, y}
 */
module.exports.start = function(path)
{
	return {x: Number(path.substr(0, 2)), y: Number(path.substr(2, 2))};
};

/**
 * Returns the first step of the path (start position) as a RoomPosition
 *
 * @param path @example 'xxyy123x456'
 * @returns RoomPosition
 */
module.exports.startRoomPosition = function(path)
{
	return this.toRoomPosition(this.start(path));
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
	if (!position && ((path.substr(3 + step, 1) === this.WAYPOINT))) {
		return this.WAYPOINT;
	}
	let pos = this.start(path);
	let i = 4;
	while (step) {
		pos = this.movePos(pos, Number(path.substr(i, 1)));
		i ++;
		step --;
	}
	return pos;
};

/**
 * Extracts the position at the given step, or WAYPOINT if the step is a waypoint, as a RoomPosition
 *
 * @param path string @example 'xxyy123w456'
 * @param step number
 * @return RoomPosition
 */
module.exports.stepRoomPosition = function(path, step)
{
	return this.toRoomPosition(this.step(path, step, true));
};

/**
 * @param pos object {x, y}
 * @return RoomPosition
 */
module.exports.toRoomPosition = function(pos)
{
	return this.room.getPositionAt(pos.x, pos.y);
};

/**
 * Unserialize a path to gets all the successive positions / waypoints
 * @param path string
 * @return Array [{x, y}|this.WAYPOINT]
 */
module.exports.unserialize = function(path)
{
	let pos    = this.start(path);
	let result = [pos];
	let i      = 4;
	while (i < path.length) {
		result.push(
			(path[i] === this.WAYPOINT)
				? this.WAYPOINT
				: (pos = this.movePos(pos, Number(path[i])))
		);
		i ++;
	}
	return result;
};

/**
 * Removes the first step from the path
 *
 * @param path    string
 * @param [count] number @default 1
 * @returns string
 */
module.exports.unshift = function(path, count)
{
	if (count === undefined) count = 1;
	let direction;
	let pos = this.start(path);
	for (let i = 0; i < count; i ++) {
	    direction = path.substr(4 + i, 1);
		if (direction !== this.WAYPOINT) {
			pos = this.movePos(pos, Number(direction));
		}
	}
	return this.serialize([pos]).concat(path.substr(4 + count));
};

/**
 * Returns the waypoint position
 *
 * @param path string @example 'xxyy123w456'
 * @param count number the waypoint number (0 for start position, 1 for first waypoint, etc)
 * @returns object {x, y}
 */
module.exports.waypoint = function(path, count = 1)
{
	let pos = this.start(path);
	if (!this.waypoint) return pos;
	let i = 4;
	while (i < path.length) {
		if (path[i] === this.WAYPOINT) {
			count --;
			if (count <= 0) {
				return pos;
			}
		}
		else {
			pos = this.movePos(pos, Number(path[i]));
		}
		i ++;
	}
	return undefined;
};

/**
 * Returns the waypoint position as a RoomPosition
 *
 * @param path string @example 'xxyy123w456'
 * @param count number the waypoint number (0 for start position, 1 for first waypoint, etc)
 * @returns RoomPosition
 */
module.exports.waypointRoomPosition = function (path, count = 1)
{
	return this.toRoomPosition(this.waypoint(path, count));
};
