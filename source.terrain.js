
/**
 * @param room    string
 * @param terrain object A found terrain object : terrain = lava|plain|swamp, type = 'terrain', x, y
 */
module.exports = function(room, terrain)
{

	/** @var string affected creep ip */
	this.creep = null;

	/** @var string room name */
	this.room = room;

	/** @var string terrain type @values lava, plain, swamp */
	this.terrain = terrain.terrain;

	/** @var integer left position */
	this.x = terrain.x;

	/** @var integer top position */
	this.y = terrain.y;

};
