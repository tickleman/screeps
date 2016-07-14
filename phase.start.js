
/**
 * Initial start phase :
 * Create the first creep : a harvest that will work at the nearest source
 */
module.exports.run = function()
{
	require('./sources').memorize();
	require('./room').prepare();
	require('./roads').build();
	Memory.phase = 'harvest';
};
