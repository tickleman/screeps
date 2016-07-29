/**
 * The heavy harvester :
 * - goes (slowly) to a free source
 * - stays near it for its all its life
 * - it harvests the energy (10 / tick) and throw it on the ground
 */

var objects = require('./objects');

module.exports.__proto__ = require('./creep');

/**
 * Body parts for a heavy harvester
 * MOVE, WORK x 5
 * - consumes 550 energy units
 */
module.exports.body_parts = [MOVE, WORK, WORK, WORK, WORK, WORK];

module.exports.role          = 'harvester';
module.exports.single_source = true;
module.exports.target_work   = false;

/**
 * Returns true if the creep can continue its source work, without any consideration about its source state
 *
 * Default behaviour : the creep can always work : it fills its carry capacity, then drops resource on the ground
 *
 * @returns boolean true
 */
module.exports.canWorkSource = function()
{
	return true;
};

/**
 * The harvester does the standard job.
 * If it has a 'CARRY' part and a nearly LINK, then it immediately stores the harvester energy into the link
 *
 * @param creep  Creep
 * @return number 0 if no error, error code if error during the job
 */
module.exports.sourceJob = function(creep)
{
	let result = module.exports.__proto__.sourceJob(creep);
	if (creep.memory.link && (result == OK) && objects.can(creep, CARRY)) {
		let link = objects.get(creep, creep.memory.link);
		if (link) {
			result = creep.transfer(link, RESOURCE_ENERGY);
			if (objects.energyRatio(link) > .9) {
				let target;
				if (link.memory.target) {
					target = Game.getObjectById(link.memory.target);
				}
				else {
					target = link.room.find(FIND_MY_STRUCTURES, { filter: structure =>
						(structure.structureType == STRUCTURE_LINK) && (structure.id != link.id)
					}).shift();
					link.memory.target = target.id;
				}
				if (target) link.transferEnergy(target);
			}
		}
	}
	return result;
};

/**
 * Select the source with the minimum count of harvesters.
 *
 * @param context RoomObject
 * @return string[] Sources id
 */
module.exports.sources = function(context)
{
	if (!this.source_work) return [];
	var min_count  = 99;
	var min_source = null;
	for (let source of context.room.find(FIND_SOURCES_ACTIVE)) {
		let count = this.sourceCount(source, context);
		if (count < min_count) {
			min_count  = count;
			min_source = source;
		}
	}
	return min_source ? [min_source] : [];
};
