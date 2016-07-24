
var objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a repairer
 * CARRY x 3, MOVE x 3, WORK x 3
 * - consume 600 energy units
 */
module.exports.body_parts = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, WORK, WORK];

module.exports.role        = 'repairer';
module.exports.source_work = false;
module.exports.wait_for_energy = true;

/**
 * Returns the next source, or null if keep the same target or no target available (current target is kept)
 *
 * @param creep Creep
 * @return RoomObject|null
 */
module.exports.nextTarget = function(creep)
{
	if (this.singleTarget(creep)) return objects.get(creep, creep.memory.target);
	return (!creep.memory.target || !objects.wounded(objects.get(creep, creep.memory.target)))
		? this.findTarget(creep)
		: null;
};

/**
 * Job is done each time the creep energy is zero (new target) and if the target is fully repaired
 *
 * @param creep Creep
 * @return boolean
 */
module.exports.targetJobDone = function(creep)
{
	if (!this.target_work) {
		if (this.DEBUG) console.log('t: target job always done (no target work)');
		return true;
	}
	let target = objects.get(creep, creep.memory.target);
	if (!target || !objects.energy(creep) || !objects.wounded(target)) return true;
	if (!this.source_work) {
		if (this.DEBUG) console.log('t: target job always continue (no source work)');
		return false;
	}
	return !objects.wounded(target);
};

/**
 * Targets are construction sites
 * If there are no construction sites : the builder becomes an upgrader
 *
 * @param context RoomObject
 * @return ConstructionSite[]
 **/
module.exports.targets = function(context)
{
	var target = context.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => objects.wounded(structure) });
	return target ? [target] : [];
};
