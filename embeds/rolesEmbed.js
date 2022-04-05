import { MessageEmbed } from "discord.js";
import { SumMedals } from "../clan/clanMember/rolesManagement.js";

export function CreateMemberRolesEmbed(clanMember, rolesData) {
	if (rolesData == null || rolesData.medals == null) {
		return 'Данные профиля не были получены. Вероятно профиль закрыт настройками приватности.\n' +
			'Настройки приватности: https://www.bungie.net/ru/Profile/Settings/?category=Privacy';
	} else {
		var medalsSum = SumMedals(clanMember.discordMember, rolesData.medals);
		const embed = new MessageEmbed()
			.setAuthor(clanMember.displayName + " 💠" + medalsSum + "💠")
			.setColor(0x00AE86)
			.setFooter("ПВП медали выдают гм-ы; ранжирование ролей: 8/17/26 • id: " + clanMember.discordMemberId,
				"https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
			.addField("Рейды", EmbedFormField(rolesData.medals.raids), true)
			.addField("Печати", EmbedFormField(rolesData.medals.seals), true)
			.addField("Наследные печати", EmbedFormField(rolesData.medals.legacy_seals), true)
			.addField("Планеты", EmbedFormField(rolesData.medals.locations), true)
			.addField("Триумфы", EmbedFormField(rolesData.medals.triumphs), true)
			.addField("Наследные триумфы", EmbedFormField(rolesData.medals.legacy_triumphs), true)
			.addField("Горнило", EmbedFormField(rolesData.medals.crucible), true)
			.addField("Сезоны", EmbedFormField(rolesData.medals.season), true)
			.addField('\u200B', '\u200B', true)
			.addField("Ссылки", "[Raid Report](https://raid.report/pc/" + clanMember.membershipId + ")"
				+ " | [Braytech](https://braytech.org/" + clanMember.membershipType + "/" + clanMember.membershipId + "/" + rolesData.characterDetails.GetBestCharacterId() + "/)"
				+ " | [D2 Checklist](https://www.d2checklist.com/" + clanMember.membershipType + "/" + clanMember.membershipId + "/triumphs)"
				+ " | [Destiny Tracker](https://destinytracker.com/destiny-2/profile/steam/" + clanMember.membershipId + "/overview)");
		return embed;
	}
}

function EmbedFormField(data) {
	var field = "";
	for (let child of Object.values(data)) {
		field = field + "\n" + EmbedFormLine(child);
	};
	return field;
}

function EmbedFormLine(data) {
	return (data.state ? "🔶 " : "🔷 ") + data.text;
}
