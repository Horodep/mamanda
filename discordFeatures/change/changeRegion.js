import config from "../../config.json" assert {type: "json"};

export function ChangeRegion(message) {
	var topRole = message.member.roles.highest.position;
	var minRole = message.guild.roles.cache.find(role => role.id == config.roles.afk).position;
	if (minRole > topRole)
		throw 'У вас нет прав на это действие.';

	if (message.guild.region == "russia") {
		message.guild.setRegion("eu-central");
		message.channel.send('Регион дискорда сменен на Европу');
	} else {
		message.guild.setRegion("russia");
		message.channel.send('Регион дискорда сменен на Россию');
	}
}