import config from "../../config.json";
import { AsyncGetFullMemberData, AsyncGetProfileData } from "../../http/bungieApi.js";
import { AsyncGetMemberByDiscordName } from "../clan.js";
import * as BungieApiLogic from "./bungieApiData.js";
import { LogRolesGranting, CheckAndProcessRole, CheckAndProcessRoleBlock, SumMedals } from "./rolesLogic.js";
import { ClanMember, GetDiscordMemberByMention } from "./clanMember.js";
import { FormRolesEmbed } from "../../embeds/rolesEmbed.js";

export async function AsyncRoles(message, args) {
	var clanMember = 
		args[1]?.startsWith('id:') ?
		await AsyncRolesByMembershipId(message.channel, args[1]) :
		await AsyncRolesByDiscordMention(message.channel, args.length > 1 ? args[1] : message.member.id);
	await AsyncGetShowAndSetRoles(clanMember, message.channel);
}

async function AsyncRolesByDiscordMention(channel, discordMention) {
	var discordMember = GetDiscordMemberByMention(channel.guild, discordMention);
	var member = await AsyncGetMemberByDiscordName(discordMember.displayName);

	var clanMember = new ClanMember(member);
	clanMember.SetDiscordMember(discordMember);
	return clanMember;
}

async function AsyncRolesByMembershipId(channel, membership) {
	var membershipType = membership.replace('id:', '').split('/')[0];
	var membershipId = membership.replace('id:', '').split('/')[1];
	var member = await AsyncGetProfileData(membershipType, membershipId);
	if (member == null) throw 'Игровой профиль не найден.';
	
	var clanMember = new ClanMember(member.data);
	clanMember.FetchDiscordMember(channel.guild);
	return clanMember;
}

export async function AsyncGetShowAndSetRoles(clanMember, channel) {
	var rolesData = await AsyncGetRolesData(clanMember.membershipType, clanMember.membershipId);
	console.log(rolesData);
	if (channel != null) channel.send(FormRolesEmbed(clanMember, rolesData));
	SetRoles(clanMember, rolesData?.characterDetails, rolesData?.medals);
}

async function AsyncGetRolesData(membershipType, membershipId) {
	var response = await AsyncGetFullMemberData(membershipType, membershipId);
	if (!response.profileRecords.data) return null;

	var data = {
		raids: {},
		locations: {},
		triumphs: {},
		seals: {},
		crucible: {},
		legacy_seals: {},
		legacy_triumphs: {},
		season: {},
		extra: {
			legacy: {}
		}
	};
	var characterDetails = BungieApiLogic.FetchCharacterData(response);
	if (!characterDetails.CharactersExist()) return { characterDetails: characterDetails, medals: null };
	var { records, collectibles, progressions } = BungieApiLogic.FetchData(response);
    
	data.raids.lw = BungieApiLogic.GetNodeData(records, 1525933460, "ПЖ");
	data.raids.gos = BungieApiLogic.GetNodeData(records, 615240848, "CC");
	data.raids.dsc = BungieApiLogic.GetNodeDataFiltered(records, 1726708384, [3560923614], [], "СГК");
	data.raids.day1 = BungieApiLogic.GetDayOneData(collectibles);
	data.locations.dc = BungieApiLogic.GetNodeData(records, 3483405511, "Город Грез");
	data.locations.moon = BungieApiLogic.GetNodeData(records, 1473265108, "Луна");
	data.locations.euro = BungieApiLogic.GetNodeDataFiltered(records, 2647590440, [3560923614], [], "Европа");
	data.triumphs.tier1 = BungieApiLogic.GetProfileRecordsCore(response, "activeScore", 12000, "");
	data.triumphs.tier2 = BungieApiLogic.GetProfileRecordsCore(response, "activeScore", 14000, "");
	data.triumphs.tier3 = BungieApiLogic.GetProfileRecordsCore(response, "activeScore", 16000, "");
	data.seals.cursebreaker = BungieApiLogic.GetNodeData(records, 560097044, "Гроза");
	data.seals.harbinger = BungieApiLogic.GetNodeData(records, 379405979, "Посланник");
	data.seals.splintered = BungieApiLogic.GetNodeData(records, 79180995, "Раскол");
	data.seals.dredgen = BungieApiLogic.GetNodeData(records, 3665267419, "Дреджен");
	data.seals.conqueror = BungieApiLogic.GetBestNode(records, [3212358005, 1376640684, 581214566], "Завоеватель");
	data.crucible.glory2100 = BungieApiLogic.GetProgressionData(progressions, 2000925172, 2100, "Ранкед");
	data.crucible.glory3500 = BungieApiLogic.GetProgressionData(progressions, 2000925172, 3500, "Ранкед");
	data.crucible.glory5450 = BungieApiLogic.GetProgressionData(progressions, 2000925172, 5450, "Ранкед");
	data.crucible.flawless = BungieApiLogic.GetBestNode(records, [3251218484, 2086100423, 1276693937], "Безупречный");
	data.legacy_seals.lore = BungieApiLogic.GetNodeData(records, 3680676656, "Летописец");
	data.legacy_seals.blacksmith = BungieApiLogic.GetNodeData(records, 450166688, "Кузнец");
	data.legacy_seals.reconeer = BungieApiLogic.GetNodeData(records, 2978379966, "Вершитель");
	data.legacy_seals.shadow = BungieApiLogic.GetNodeData(records, 717225803, "Тень");
	data.legacy_triumphs.t80k = BungieApiLogic.GetProfileRecordsCore(response, "legacyScore", 80000, "");
	data.legacy_triumphs.t100k = BungieApiLogic.GetProfileRecordsCore(response, "legacyScore", 100000, "");
	data.legacy_triumphs.t120k = BungieApiLogic.GetProfileRecordsCore(response, "legacyScore", 120000, "");
	data.season.seal = BungieApiLogic.GetNodeData(records, 1321008463, "Смотритель");
	data.season.triumphs = BungieApiLogic.GetNodeDataFiltered(records, 2255100699, [],
		[1951157616, 4186991151, 3518211070, 975308347, 25634498], "Триумфы");
	data.extra.poi = BungieApiLogic.GetIfPersonOfInterest(records);
	data.extra.legacy.season8 = BungieApiLogic.GetNodeData(records, 955166374, "Undying");
	data.extra.legacy.season9 = BungieApiLogic.GetNodeData(records, 955166375, "Dawn");
	data.extra.legacy.season10 = BungieApiLogic.GetNodeData(records, 1321008461, "Almighty");
	data.extra.legacy.season11 = BungieApiLogic.GetNodeData(records, 1321008460, "Arrivals");

	return { characterDetails: characterDetails, medals: data };
}

function SetRoles(clanMember, characterDetails, medals) {
	LogRolesGranting(clanMember.displayName, clanMember.discordMemberExists, medals);
	if (!clanMember.discordMemberExists) return;

	var discordMember = clanMember.discordMember;

	CheckAndProcessRole(discordMember, config.roles.separators.clanname, true, false);
	CheckAndProcessRole(discordMember, config.roles.clans[0], clanMember.clanId == config.clans[0].id, false);
	CheckAndProcessRole(discordMember, config.roles.clans[1], clanMember.clanId == config.clans[1].id, false);
	CheckAndProcessRole(discordMember, config.roles.separators.characters, true, false);
	CheckAndProcessRole(discordMember, config.roles.separators.medals, true, false);
	CheckAndProcessRole(discordMember, config.roles.separators.footer, true, false);

	if (characterDetails == null) return;
	CheckAndProcessRole(discordMember, config.roles.characters.warlock, characterDetails.warlock.light >= config.minimal_light, false);
	CheckAndProcessRole(discordMember, config.roles.characters.hunter, characterDetails.hunter.light >= config.minimal_light, false);
	CheckAndProcessRole(discordMember, config.roles.characters.titan, characterDetails.titan.light >= config.minimal_light, false);

	if (discordMember.roles.cache.find(role => role.id == config.roles.no_medals) != null) return;
	if (medals == null) return;

	CheckAndProcessRole(discordMember, config.roles.medals.specific.day1, medals.raids.day1.state, false);
	CheckAndProcessRole(discordMember, config.roles.medals.specific.poi, medals.extra.poi.state, false);

	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.raids, 4, medals.raids);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.seals, 5, medals.seals);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.legacy_seals, 4, medals.legacy_seals);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.locations, 3, medals.locations);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.triumphs, 3, medals.triumphs);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.legacy_triumphs, 3, medals.legacy_triumphs);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.season, 2, medals.season);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.extralegacy, 4, medals.extra.legacy);

	if (discordMember.roles.cache.find(role => role.id == config.roles.guildleader) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.guildmaster) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.afk) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.newbie) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.guest) != null) return;

	var sum = SumMedals(discordMember, medals);
	CheckAndProcessRole(discordMember, config.roles.guardians[0], sum >= 0, sum >= 7);
	CheckAndProcessRole(discordMember, config.roles.guardians[1], sum >= 7, sum >= 16);
	CheckAndProcessRole(discordMember, config.roles.guardians[2], sum >= 16, sum >= 24);
	CheckAndProcessRole(discordMember, config.roles.guardians[3], sum >= 24, false);
}