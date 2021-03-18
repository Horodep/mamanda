import { MessageEmbed } from "discord.js";

export function CreateEmbedForRecordStatistics(membersSucceeded, i, size, recordData) {
	const embed = new MessageEmbed()
		.setAuthor(recordData.name + (i == size ? "" : " [" + i + "/" + size + "]"))
		.setColor(0x00AE86)
		.setThumbnail('https://www.bungie.net' + recordData.icon)
		.setFooter(recordData.description, "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png");

	if (membersSucceeded.length > 0)
		embed.addField(
			"1 - " + Math.round(membersSucceeded.length / 2),
			membersSucceeded
				.sort()
				.filter((_, i) => i < membersSucceeded.length / 2)
				.map(member => member.displayName)
				.join("\n")
			, true);
	if (membersSucceeded.length > 1)
		embed.addField(
			(Math.round(membersSucceeded.length / 2) + 1) + " - " + membersSucceeded.length,
			membersSucceeded
				.sort()
				.filter((_, i) => i >= membersSucceeded.length / 2)
				.map(member => member.displayName)
				.join("\n")
			, true);
	return embed;
}
