
/**
 * @type string[]
 */
module.exports.ERRORS = {
	'0':   'ok',
	'-1':  'not-own',
	'-2':  'no-path',
	'-3':  'name-exists',
	'-4':  'busy',
	'-5':  'not-found',
	'-6':  'no-energy',
	'-7':  'bad-target',
	'-8':  'full',
	'-9':  'no-range',
	'-10': 'invalid-args',
	'-11': 'tired',
	'-12': 'no-body',
	'-14': 'rcl-low',
	'-15': 'gcl-low'
};

/**
 * Gets a short message matchnig the error code
 *
 * @param error number
 */
module.exports.error = function(error)
{
	return this.ERRORS[error.toString()] ? this.ERRORS[error] : error;
};
