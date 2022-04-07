import config from "../config.json" assert {type: "json"};
import { CatchError } from "../catcherror.js";

export async function AsyncMessageReactionRemove(reaction, user) {
	try {
		if(user.bot) return;
		if (reaction.partial) await reaction.fetch();
		console.log(`${user.username} removed reaction ${reaction._emoji.name}.`);

		if (reaction.message.channel.id == config.channels.wishes) HandleWishes(reaction, user);
	} catch (error) {
		CatchErrorAndDeleteByTimeout(error, reaction?.message?.channel, 15000);
		return;
	}
};

function HandleWishes(reaction, user) {
	var member = reaction.message.member.guild.members.cache.find(m => m.user.id === user.id);
	console.log(reaction.message.content);

	switch (reaction.message.content) {
		case "Хочу Петраран (Последнее Желание без смертей)":
			member.roles.remove(config.roles.wishes.lw);
			break;
		case "Хочу Совершенство (Сад Спасения без смертей)":
			member.roles.remove(config.roles.wishes.gos);
			break;
		case "Хочу Выжить (Склеп Глубокого Камня без смертей)":
			member.roles.remove(config.roles.wishes.dsc);
			break;
		case "Хочу Хрустальный Сервиз (Хрустальный чертог без смертей)":
			member.roles.remove(config.roles.wishes.vog);
			break;
		case "Хочу Глубинное Возрождение (Клятва Послушника без смертей)":
			member.roles.remove(config.roles.wishes.vod);
			break;
	}
}
