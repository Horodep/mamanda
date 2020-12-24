import { MessageEmbed } from "discord.js";

export function FormNicknamesEmbed(discordPsnList, discordList, gameList, size) {
	const embed = new MessageEmbed()
		.setAuthor("Aurora")
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp();
	if (discordPsnList.length > 0)
		embed.addField("PSN: " + discordPsnList.length + "/" + size, discordPsnList.join("\n"), true);
	if (discordList.length > 0)
		embed.addField("Дискорд: " + discordList.length + "/" + size, discordList.join("\n"), true);
	if (gameList.length > 0)
		embed.addField("Игра: " + gameList.length + "/" + size, gameList.join("\n"), true);
	return embed;
}
