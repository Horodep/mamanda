import { MessageEmbed } from "discord.js";

export function CreateTopTriumphScoreEmbed(members, i, size) {
	const embed = new MessageEmbed()
		.setAuthor({ name: "Triumphs score [top 15]:" + (i == size ? "" : " [" + i + "/" + size + "]") })
		.setColor(0x00AE86)
		.setDescription(members
			.sort((a, b) => (a.activeScore > b.activeScore ? -1 : 1))
			.filter((_, i) => i < 15)
			.map(m => "`" + m.activeScore + "` " + m.displayName)
			.join('\n'))
		.setFooter({ text: 'Horobot', iconURL: 'https://cdn.discordapp.com/avatars/564870880853753857/127385781e26e7dcfdbe312de1843ddf.png' })
		.setTimestamp();
	return { embeds: [embed] };
}
