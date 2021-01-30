import config from "../config.json";
import { AddRaidMember, RemoveRaidMember, KickRaidMember, CancelRaid } from "../raid.js";
import { CatchError } from "../catcherror.js";

export async function AsyncMessageReactionAdd(reaction, user) {
	try {
		if(user.bot) return;
		if (reaction.partial) await reaction.fetch();
		console.log(`${user.username} set reaction ${reaction._emoji.name}.`);

		if (reaction.message.channel.id == config.channels.wishes) HandleWishes(reaction, user);
		else if (reaction.message.embeds[0]?.footer?.text.startsWith("Собрал")) HandleRaids(reaction, user);
		else HandleOther(reaction, user);
	} catch (error) {
		CatchErrorAndDeleteByTimeout(error, reaction?.message?.channel, 15000);
		return;
	}
};

function HandleOther(reaction, user) {
	var member = reaction.message.guild.members.cache.find(m => m.id == user.id);
	if (member == null) return;
	switch (reaction._emoji.name) {
		case "🆗":
			member.roles.remove(config.roles.forum_tag);
			break;
	}
}

function HandleRaids(reaction, user) {
	switch (reaction._emoji.name) {
		case "yes":
			AddRaidMember(reaction.message, user);
			reaction.users.remove(user);
			break;
		case "no":
			RemoveRaidMember(reaction.message, user, true);
			reaction.users.remove(user);
			break;
		case "🚫":
			console.log('ive got an emoji');
			CancelRaid(reaction.message, user);
			console.log('check for emoji and delete');
			if (typeof (reaction.message) != "undefined") reaction.users.remove(user);
			console.log('emoji deleted');
			break;
		case "1️⃣":
		case "2️⃣":
		case "3️⃣":
		case "4️⃣":
		case "5️⃣":
		case "6️⃣":
		case "7️⃣":
		case "8️⃣":
		case "9️⃣":
		case "0️⃣":
			KickRaidMember(reaction.message, user, reaction);
			reaction.users.remove(user);
			break;
	}
}

function HandleWishes(reaction, user) {
	var member = reaction.message.guild.members.cache.find(m => m.user.id === user.id);
	if (member == null) return;
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