/**
 * The trans-harvester harvests a source into a foreign room
 */

let objects = require('./objects');

module.exports.__proto__ = require('./creep.harvester');

/**
 * Body parts for a fast harvester
 * MOVE x 5, WORK x 5
 * - consumes 750 energy units
 */
module.exports.body_parts = [MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK];

module.exports.role = 'trans_harvester';

/**
 * @param creep Creep
 * @return number
 */
module.exports.sourceJob = function(creep)
{
	if (creep.room.name === this.sourceRoomName(creep)) {
		if (!creep.pos.x)            creep.move(RIGHT);
		else if (!creep.pos.y)       creep.move(BOTTOM);
		else if (creep.pos.x === 49) creep.move(LEFT);
		else if (creep.pos.y === 49) creep.move(TOP);
		else return module.exports.__proto__.sourceJob(creep);
		return OK;
	}
	return ERR_NOT_IN_RANGE;
};

/**
 * @param creep Creep
 * @return boolean
 */
module.exports.sourceJobDone = function(creep)
{
	return (creep.room.name === this.sourceRoomName(creep))
		? module.exports.__proto__.sourceJobDone(creep)
		: !objects.range(creep, Game.flags[creep.memory.source_flag]);
};

/**
 * Select the source with the minimum count of harvesters.
 *
 * @param context RoomObject
 * @return string[] Sources id
 */
module.exports.sources = function(context)
{
	if (context instanceof Creep) {
		return (context.room.name === this.sourceRoomName(context))
			? [context.room.find(FIND_SOURCES_ACTIVE).shift()]
			: [Game.flags[context.memory.source_flag]];
	}
	return [];
};

/**
 * @param creep Creep
 * @returns string
 */
module.exports.sourceRoomName = function(creep)
{
	return (creep instanceof Creep)
		? creep.memory.source_flag.substr(creep.memory.source_flag.indexOf('-') + 1)
		: '';
};

/**
 * @param opts object needs spawn and source
 * @returns Creep|null
 */
module.exports.spawn = function(opts)
{
	let creep = module.exports.__proto__.spawn(opts);
	if (creep) {
		creep.memory.source        = opts.flag.name;
		creep.memory.source_flag   = opts.flag.name;
		opts.flag.memory.harvester = creep.name;
	}
	return creep;
};
