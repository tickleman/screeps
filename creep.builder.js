
var objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a heavy builder
 * CARRY x 2, MOVE, WORK x 4
 * - consume 550 energy units
 */
module.exports.body_parts = [CARRY, CARRY, MOVE, WORK, WORK, WORK, WORK];

module.exports.role            = 'builder';
module.exports.source_work     = false;
module.exports.wait_for_energy = true;

/**
 * Targets are construction sites
 * If there are no construction sites : the builder becomes an upgrader
 *
 * @param context RoomObject
 * @return ConstructionSite[]
 **/
module.exports.targets = function(context)
{
	var target = context.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
	return target ? [target] : [];
};
