
/**
 * @type string[]
 */
module.exports.ERRORS = {
	ERR_BUSY:                  'BUSY',
	ERR_FULL:                  'FULL',
	ERR_GCL_NOT_ENOUGH:        'GCL-LOW',
	ERR_INVALID_ARGS:          'INVALID-ARGS',
	ERR_INVALID_TARGET:        'BAD-TARGET',
	ERR_NAME_EXISTS:           'NAME-EXISTS',
	ERR_NO_BODYPART:           'NO-BODY',
	ERR_NO_PATH:               'NO-PATH',
	ERR_NOT_ENOUGH_ENERGY:     'NO-ENERGY',
	ERR_NOT_ENOUGH_EXTENSIONS: 'MISS-EXTENSIONS',
	ERR_NOT_ENOUGH_RESOURCES:  'NO-RESOURCE',
	ERR_NOT_IN_RANGE:          'NO-RANGE',
	ERR_NOT_FOUND:             'NOT-FOUND',
	ERR_NOT_OWNER:             'NOT-OWNER',
	ERR_RCL_NOT_ENOUGH:        'RCL-LOW',
	ERR_TIRED:                 'TIRED',
	OK:                        'OK'
};

/**
 * @type string
 */
module.exports.UNKNOWN = '?';

/**
 * Gets a short message matchnig the error code
 *
 * @param error number
 */
module.exports.error = function(error)
{
	return this.ERRORS[error] ? this.ERRORS[error] : this.UNKNOWN;
};
