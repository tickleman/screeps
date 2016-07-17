
var start          = require('./phase.start');
var harvest        = require('./phase.harvest');
var specialization = require('./phase.specialization');
var tasks          = require('./tasks');
var tower          = require('./structure.tower');

module.exports.loop = function ()
{
	if      (!Memory.phase)                    start.run();

	/*
	for (var structure_id in Game.structures) if (Game.structures.hasOwnProperty(structure_id)) {
		var structure = Game.structures[structure_id];
		if (structure.structureType == STRUCTURE_TOWER) {
			tower.run(structure);
		}
	}

	if      (!Memory.phase)                    start.run();
	else if (Memory.phase == 'harvest')        harvest.run();
	else if (Memory.phase == 'specialization') specialization.run();

	// count existing creeps


	// spawn
	let unaffected_list = tasks.unaffected();
	for (let unaffected in unaffected_list) if (unaffected_list.hasOwnProperty(unaffected)) {

	}
	*/
};
