import { MessageEmbed } from "discord.js";

export function CreateNicknameComparisonEmbed(discordPsnList, discordList, gameList, size) {
	const embed = new MessageEmbed()
		.setAuthor({ name: "Aurora" })
		.setColor(0x00AE86)
		.setFooter({ text: 'Horobot', iconURL: 'https://cdn.discordapp.com/avatars/564870880853753857/127385781e26e7dcfdbe312de1843ddf.png' })
		.setTimestamp();
	if (discordPsnList.length > 0)
		embed.addField("PSN: " + discordPsnList.length + "/" + size, discordPsnList.join("\n"), true);
	if (discordList.length > 0)
		embed.addField("Дискорд: " + discordList.length + "/" + size, discordList.join("\n"), true);
	if (gameList.length > 0)
		embed.addField("Игра: " + gameList.length + "/" + size, gameList.join("\n"), true);
	return { embeds: [embed] };
}
