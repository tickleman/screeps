module.exports =
{

	/**
	 * @param creep Creep
	 **/
	run: function(creep)
	{
		var controller = Game.getObjectById(creep.memory.target);
		if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(controller);
		}
		return true;
	}

};
