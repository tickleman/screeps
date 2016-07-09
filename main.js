
var start   = require('phase.start');
var harvest = require('phase.harvest');

module.exports.loop = function ()
{
	if (!_.filter(Game.creeps))    Memory.phase = 'start';
	if (Memory.phase == 'start')   start.run();
	if (Memory.phase == 'harvest') harvest.run();
};
