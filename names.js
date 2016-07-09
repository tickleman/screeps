
module.exports.bappli = [
	'Baptiste', 'Benoît', 'Géraldine', 'Gilles', 'Hoel', 'Olivier', 'Philippe', 'Pierrick', 'Rémi', 'Sébastien', 'Thomas', 'Zhuo'
];

module.exports.fightclub = [
	'Brad', 'David', 'Edward', 'Eion', 'Jared', 'Helena', 'Marla', 'Meat', 'Richard', 'Ricky', 'Robert', 'Tyler', 'Zach'
];

module.exports.use_names = ['bappli', 'fightclub'];

module.exports.chooseName = function()
{
	var name;
	for (var i = 0; i < this.use_names.length; i ++) {
		console.log('are there available names for ' + this.use_names[i] + ' ?');
		if (Game.creeps.length < this[this.use_names[i]].length) {
			console.log('yes');
			for (; !name || Game.creeps[name]; name = this.names[Math.floor(Math.random() * this.names.length)]) {}
			console.log('choose name ' + name);
			return name;
		}
	}
	console.log('no available name');
	return undefined;
};
