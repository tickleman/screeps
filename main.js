
var start          = require('./phase.start');
var harvest        = require('./phase.harvest');
var specialization = require('./phase.specialization');

module.exports.loop = function ()
{
	if (!_.filter(Game.creeps)) Memory.phase = 'start';
	else if (Memory.phase == 'start')          start.run();
	else if (Memory.phase == 'harvest')        harvest.run();
	else if (Memory.phase == 'specialization') specialization.run();
};
