import config from "../config.json";

export function InviteFriend(message, discordMention) {
	var topRole = message.member.roles.highest.position;
	var minRole = message.guild.roles.cache.find(role => role.id == config.roles.guardians[1]).position;
	if (minRole > topRole)
		throw 'У вас нет прав на это действие.';

	var discordId = discordMention.replace(/\D/g, '');
	var discordMember = message.guild.members.cache.find(member => member.user.id == discordId);
	if (discordMember == null)
		throw 'Страж не найден.';

	if (discordMember.roles.cache.size == 1) {
		discordMember.roles.add(config.roles.guest);
		message.channel.send(`Стража <@${discordId}> пустили на сервер.`);
	}
}
