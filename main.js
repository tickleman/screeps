
var start          = require('./phase.start');
var harvest        = require('./phase.harvest');
var specialization = require('./phase.specialization');
var tower          = require('./structure.tower');

module.exports.loop = function ()
{
	for (var structure_id in Game.structures) if (Game.structures.hasOwnProperty(structure_id)) {
		var structure = Game.structures[structure_id];
		if (structure.structureType == STRUCTURE_TOWER) {
			tower.run(structure);
		}
	}

	if      (!Memory.phase)                    start.run();
	else if (Memory.phase == 'harvest')        harvest.run();
	else if (Memory.phase == 'specialization') specialization.run();
};
