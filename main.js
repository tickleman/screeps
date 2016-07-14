
var start          = require('./phase.start');
var harvest        = require('./phase.harvest');
var specialization = require('./phase.specialization');

module.exports.loop = function ()
{
	if      (!Memory.phase)                    start.run();
	else if (Memory.phase == 'harvest')        harvest.run();
	else if (Memory.phase == 'specialization') specialization.run();
};
