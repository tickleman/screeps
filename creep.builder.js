
var objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a heavy builder
 * CARRY x 3, MOVE, WORK x 3
 * - consumes 500 energy units
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, MOVE, WORK, WORK, WORK];

module.exports.role        = 'builder';
module.exports.source_work = false;

/**
 * Targets are construction sites
 * If there are no construction sites : the builder becomes an upgrader
 *
 * @param context RoomObject
 * @returns ConstructionSite[]
 **/
module.exports.targets = function(context)
{
	return context.room.find(FIND_CONSTRUCTION_SITES);
};
