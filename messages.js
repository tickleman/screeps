
/**
 * @type string[]
 */
module.exports.ERRORS = {
	'0':   'OK',
	'-1':  'NOT-OWNER',
	'-2':  'NO-PATH',
	'-3':  'NAME-EXISTS',
	'-4':  'BUSY',
	'-5':  'NOT-FOUND',
	'-6':  'NO-ENERGY',
	'-7':  'BAD-TARGET',
	'-8':  'FULL',
	'-9':  'NO-RANGE',
	'-10': 'INVALID-ARGS',
	'-11': 'TIRED',
	'-12': 'NO-BODY',
	'-14': 'RCL-LOW',
	'-15': 'GCL-LOW'
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
