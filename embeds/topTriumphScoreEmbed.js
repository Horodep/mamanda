import { MessageEmbed } from "discord.js";

export function CreateTopTriumphScoreEmbed(members, i, size) {
	const embed = new MessageEmbed()
		.setAuthor("Triumphs score [top 15]:" + (i == size ? "" : " [" + i + "/" + size + "]"))
		.setColor(0x00AE86)
		.setDescription(members
			.sort((a, b) => (a.activeScore > b.activeScore ? -1 : 1))
			.filter((_, i) => i < 15)
			.map(m => "`" + m.activeScore + "` " + m.displayName)
			.join('\n'))
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp();
	return embed;
}
