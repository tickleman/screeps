module.exports =
{

	/**
	 * @param creep Creep
	 **/
	run: function(creep)
	{
		if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
		}
		return true;
	}

};
