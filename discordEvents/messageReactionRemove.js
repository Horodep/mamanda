import config from "../config.json";

export async function MessageReactionRemove(reaction, user) {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			return;
		}
	}
	console.log(`${user.username} removed reaction ${reaction._emoji.name}.`);

	if (reaction.message.channel.id == config.channels.wishes) HandleWishes(reaction, user);
};

function HandleWishes(reaction, user) {
	var member = reaction.message.member.guild.members.find(m => m.user.id === user.id);

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