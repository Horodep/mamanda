import config from "../config.json";
import { CatchError } from "../catcherror.js";

export async function AsyncMessageReactionRemove(reaction, user) {
	if(user.bot) return;
	if (reaction.partial) {
		try /*need to check if needed*/{
			await reaction.fetch();
		} catch (error) {
			error.name = 'Something went wrong when fetching the reaction: ' + error.name;
			CatchError(error);
			return;
		}
	}
	console.log(`${user.username} removed reaction ${reaction._emoji.name}.`);

	if (reaction.message.channel.id == config.channels.wishes) HandleWishes(reaction, user);
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
	}
}
