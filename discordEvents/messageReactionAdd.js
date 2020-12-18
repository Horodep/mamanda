import config from "../config.json";
import { CancelRaid, KickRaidMember, RemoveRaidMember } from "../raid";

export async function MessageReactionAdd(reaction, user) {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}
	console.log(`${user.username} set reaction ${reaction._emoji.name}.`);

	if (reaction.message.channel.id == config.channels.wishes) HandleWishes(reaction, user);
	else if (reaction.message.embeds[0]?.footer.text.startsWith("Собрал")) HandleRaids(reaction, user);
	else HandleOther(reaction, user);
};

function HandleOther(reaction, user) {
	switch (reaction._emoji.name) {
		case "🆗":
			member.removeRole(config.roles.forum_tag);
			console.log(user.username + " set OK to bot message.");
			break;
	}
}

function HandleRaids(reaction, user) {
	switch (reaction._emoji.name) {
		case ":yes:769922757592612874":
			AddRaidMember(reaction.message, user, reaction);
			reaction.remove(user);
			break;
		case ":no:769922772549632031":
			RemoveRaidMember(reaction.message, user, reaction);
			reaction.remove(user);
			break;
		case "🚫":
			CancelRaid(reaction.message, user, reaction);
			if (typeof (reaction.message) != "undefined") reaction.remove(user);
			break;
		default:
			KickRaidMember(reaction.message, user, reaction);
			reaction.remove(user);
			break;
	}
}

function HandleWishes(reaction, user) {
	var member = reaction.message.guild.members.cache.find(m => m.user.id === user.id);
	var suggestionsChannel = user.client.channels.cache.get(config.channels.suggestions);
	var firstLine = reaction.message.content.split('\n');
	console.log(firstLine[0]);

	switch (firstLine[0]) {
		case "Хочу Петраран (Последнее Желание без смертей)":
			member.roles.add(config.roles.wishes.lw);
			break;
		case "Хочу Совершенство (Сад Спасения без смертей)":
			member.roles.add(config.roles.wishes.gos);
			break;
		case "Хочу Выжить (Склеп Глубокого Камня без смертей)":
			member.roles.add(config.roles.wishes.dsc);
			break;
		case "Хочу быть ГМ-ом. ":
			suggestionsChannel.send("<@" + user.id + "> хочет стать ГМ-ом.");
			break;
		case "Хочу быть рейд лидером.":
			suggestionsChannel.send("<@" + user.id + "> хочет стать рейд лидером.");
			break;
	}
}