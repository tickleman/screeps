
var roads   = require('./roads');
var room    = require('./room');
var sources = require('./sources');

/**
 * Initial start phase :
 * Create the first creep : a harvest that will work at the nearest source
 */
module.exports.run = function()
{
	sources.memorize();
	room.prepareRoutes();
	roads.build();
	Memory.phase = 'harvest';
};
