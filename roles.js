import Discord from "discord.js";
import config from "./config.json";
import { CatchError } from "./catcherror.js";
import { GetFullMemberData } from "./bungieApi.js";
import { FindMemberByFullName } from "./clan.js";
import * as BungieApiLogic from "./coreLogic/bungieApiDataLogic.js";
import { LogRolesGranting, CheckAndProcessRole, CheckAndProcessRoleBlock, SumMedals, EmbedFormField } from "./coreLogic/rolesLogic.js";
import { ClanMember } from "./clanMember.js";

export function Roles(message, args){
	if (args.length == 1){
		RolesByDiscordMention(message.channel, message.member.id);
	}else if(args[1].startsWith('id:')){
		RolesByMembershipId(message.channel, args[1]);
	}else{
		RolesByDiscordMention(message.channel, args[1]);
	}
}

export async function RolesByDiscordMention(channel, discordMention){
	console.log(discordMention);
	var discordId = discordMention.replace(/\D/g,'');
	var discordMember = channel.guild.members.cache.find(member => member.user.id == discordId);
	if(discordMember == null){
		channel.send('Дискорд профиль не найден.');
		return;
	}

	try{
		var member = await FindMemberByFullName(discordMember.displayName);
		if(member==null) {
			channel.send('Игровой профиль не найден.');
			return;
		}

		var clanMember = new ClanMember(member.destinyUserInfo, member.groupId);
		clanMember.SetDiscordMember(discordMember);

		var rolesData = await GetRolesData(clanMember.membershipType, clanMember.membershipId);
		
		console.log(rolesData);
		SendRolesMessage(channel, clanMember, rolesData);
		SetRoles(clanMember, rolesData.characterDetails, rolesData.medals);
	}catch(e){
		CatchError(e, channel);
	}
}

export function RolesByMembershipId(channel, membership){
	var membershipType = membership.replace('id:','').split('/');
	var membershipId = membership.replace('id:','').split('/');

	var discordMember = channel.guild.members.find(member => member.user.id == 0);

	var rolesData = GetRolesData(membershipType, membershipId);
	
	console.log(rolesData);
	SendRolesMessage(channel, discordMember, profileData, rolesData);

	channel.send('Временно (или нет) не выдает роли.');

	SetRoles(discordMember, rolesData.charactersLight, rolesData.medals, clanid, profileData.displayName);
}

async function GetRolesData(membershipType, membershipId) {
	var response = await GetFullMemberData(membershipType, membershipId);
	if(typeof(response.profileRecords.data) == 'undefined') return null;
	
	var data = {
		raids:{}, 
		locations:{}, 
		triumphs:{}, 
		seals:{}, 
		crucible:{}, 
		legacy_seals:{}, 
		legacy_triumphs:{}, 
		season:{}, 
		extra:{}
	};
	var characterDetails = BungieApiLogic.get_character_details(response);
	
	if(!characterDetails.CharactersExist()) return {characterDetails: characterDetails, medals: null};

	//				ROLES
	var characterPresentationNodes = [];
	var characterRecords = [];
	var characterProgressions = [];
	var characterCollectibles = [];
	for (var characterID in response.characterPresentationNodes.data) characterPresentationNodes.push([characterID, response.characterPresentationNodes.data[characterID]]);
	for (var characterID in response.characterRecords.data) characterRecords.push([characterID, response.characterRecords.data[characterID]]);
	for (var characterID in response.characterProgressions.data) characterProgressions.push([characterID, response.characterProgressions.data[characterID]]);
	for (var characterID in response.characterProgressions.data) characterCollectibles.push([characterID, response.characterCollectibles.data[characterID]]);
	
	data.raids.lw  = BungieApiLogic.get_node_data(response, 1525933460, "ПЖ");
	data.raids.gos = BungieApiLogic.get_node_data(response,  615240848, "CC");
	data.raids.dsc = BungieApiLogic.get_node_data(response, 1726708384, "СГК");
	data.raids.day1 = BungieApiLogic.get_day_one(response, characterCollectibles);
	data.locations.dc   = BungieApiLogic.get_node_data(response, 3483405511, "Город Грез");
	data.locations.moon = BungieApiLogic.get_node_data(response, 1473265108, "Луна");
	data.locations.euro = BungieApiLogic.get_node_data(response, 2647590440, "Европа");
	data.triumphs.t10k = BungieApiLogic.get_profile_records(response, "activeScore", 10000, "");
	data.triumphs.t15k = BungieApiLogic.get_profile_records(response, "activeScore", 15000, "");
	data.triumphs.t20k = BungieApiLogic.get_profile_records(response, "activeScore", 20000, "");
	data.seals.cursebreaker = BungieApiLogic.get_character_node_data(characterPresentationNodes, 560097044, "Гроза");
	data.seals.harbinger = BungieApiLogic.get_node_data(response, 379405979, "Посланник");
	data.seals.splintered = BungieApiLogic.get_node_data(response, 79180995, "Раскол");
	data.seals.dredgen = BungieApiLogic.get_node_data(response, 3665267419, "Дреджен");
	data.seals.conqueror = BungieApiLogic.get_any_of_data(characterPresentationNodes, [3212358005, 1376640684], "Завоеватель");
	data.crucible.glory2100 = BungieApiLogic.get_character_progression_data(characterProgressions, 2000925172, 2100, "Ранкед");
	data.crucible.glory3500 = BungieApiLogic.get_character_progression_data(characterProgressions, 2000925172, 3500, "Ранкед");
	data.crucible.glory5450 = BungieApiLogic.get_character_progression_data(characterProgressions, 2000925172, 5450, "Ранкед");
	data.crucible.flawless = BungieApiLogic.get_any_of_data(characterPresentationNodes, [3251218484, 2086100423, 1276693937], "Безупречный");
	data.legacy_seals.lore = BungieApiLogic.get_character_node_data(characterPresentationNodes, 3680676656, "Летописец");
	data.legacy_seals.blacksmith = BungieApiLogic.get_character_node_data(characterPresentationNodes, 450166688, "Кузнец");
	data.legacy_seals.reconeer = BungieApiLogic.get_character_node_data(characterPresentationNodes, 2978379966, "Вершитель");
	data.legacy_seals.shadow = BungieApiLogic.get_character_node_data(characterPresentationNodes, 717225803, "Тень");
	data.legacy_triumphs.t80k = BungieApiLogic.get_profile_records(response, "legacyScore", 80000, "");
	data.legacy_triumphs.t100k = BungieApiLogic.get_profile_records(response, "legacyScore", 100000, "");
	data.legacy_triumphs.t120k = BungieApiLogic.get_profile_records(response, "legacyScore", 120000, "");
	data.season.seal = BungieApiLogic.get_character_node_data(characterPresentationNodes, 1321008463, "Смотритель");
	data.season.triumphs = BungieApiLogic.get_season_triumphs(response, characterPresentationNodes, 2255100699, 
		[91071118,1951157616,4186991151,3518211070,975308347,25634498], "Триумфы");
	data.extra.poi = BungieApiLogic.get_poi(response);
	data.extra.solo = BungieApiLogic.get_all_nodes(response, [3841336511, 3899996566]);
	data.extra.soloflawless = BungieApiLogic.get_all_nodes(response, [3950599483, 3205009787]);
	
	return {characterDetails: characterDetails, medals: data};
}

function SendRolesMessage(channel, clanMember, rolesData){
	if(rolesData.medals == null) {
		channel.send('Данные профиля не были получены. Вероятно профиль закрыт настройками приватности.\n'+
					 'Настройки приватности: https://www.bungie.net/ru/Profile/Settings/?category=Privacy');
	}else{
		var medalsSum = SumMedals(clanMember.discordMemberObject, rolesData.medals)
		const embed = new Discord.MessageEmbed()
			.setAuthor(clanMember.displayName + " 💠" + medalsSum + "💠")
			.setColor(0x00AE86)
			.setFooter("ПВП медали выдают гм-ы; ранжирование ролей: 7/16/24 • id: "+clanMember.discordMemberId, 
				"https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
			.addField("Рейды",    			EmbedFormField(rolesData.medals.raids), true)
			.addField("Печати",   			EmbedFormField(rolesData.medals.seals), true)
			.addField("Наследные печати", 	EmbedFormField(rolesData.medals.legacy_seals), true)
			.addField("Планеты",  			EmbedFormField(rolesData.medals.locations), true)
			.addField("Триумфы",  			EmbedFormField(rolesData.medals.triumphs), true)
			.addField("Наследные триумфы", 	EmbedFormField(rolesData.medals.legacy_triumphs), true)
			.addField("Горнило",  			EmbedFormField(rolesData.medals.crucible), true)
			.addField("Сезон 12",			EmbedFormField(rolesData.medals.season), true)
			.addField('\u200B', '\u200B', true)
	        .addField("Ссылки", "[Raid Report](https://raid.report/pc/"+clanMember.membershipId+")"
							+" | [Braytech](https://beta.braytech.org/"+clanMember.membershipType+"/"+clanMember.membershipId+"/"+rolesData.characterDetails.GetBestCharacterId()+"/)"
							+" | [D2 Checklist](https://www.d2checklist.com/"+clanMember.membershipType+"/"+clanMember.membershipId+"/triumphs)"
							+" | [Destiny Tracker](https://destinytracker.com/destiny-2/profile/steam/"+clanMember.membershipId+"/overview)")
		channel.send({embed});
	}
}

function SetRoles(clanMember, characterDetails, medals){
	LogRolesGranting(clanMember.displayName, clanMember.discordMemberExists, medals);
	if(!clanMember.discordMemberExists) return;
	
	var discordMember = clanMember.discordMember;

	CheckAndProcessRole(discordMember, config.roles.separators.clanname, true, false);
	CheckAndProcessRole(discordMember, config.roles.clans[0], clanMember.clanId == config.clans[0].id, false);
	CheckAndProcessRole(discordMember, config.roles.clans[1], clanMember.clanId == config.clans[1].id, false);
	CheckAndProcessRole(discordMember, config.roles.separators.characters, true, false);
	CheckAndProcessRole(discordMember, config.roles.characters.warlock, characterDetails.warlock.light >= config.minimal_light, false);
	CheckAndProcessRole(discordMember, config.roles.characters.hunter, characterDetails.hunter.light >= config.minimal_light, false);
	CheckAndProcessRole(discordMember, config.roles.characters.titan, characterDetails.titan.light >= config.minimal_light, false);
	CheckAndProcessRole(discordMember, config.roles.separators.medals, true, false);
	CheckAndProcessRole(discordMember, config.roles.separators.footer, true, false);
	
	if (discordMember.roles.cache.find(role => role.id == config.roles.no_medals) != null) return;
	if (medals == null) return;

	CheckAndProcessRole(discordMember, config.roles.medals.specific.day1, medals.raids.day1.state, false);
	CheckAndProcessRole(discordMember, config.roles.medals.specific.solo, medals.extra.solo.state, medals.extra.soloflawless.state);
	CheckAndProcessRole(discordMember, config.roles.medals.specific.soloflawless, medals.extra.soloflawless.state, false);
	CheckAndProcessRole(discordMember, config.roles.medals.specific.poi, medals.extra.poi.state, false);

	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.raids, 4, medals.raids);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.seals, 5, medals.seals);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.legacy_seals, 4, medals.legacy_seals);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.locations, 3, medals.locations);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.triumphs, 3, medals.triumphs);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.legacy_triumphs, 3, medals.legacy_triumphs);
	CheckAndProcessRoleBlock(discordMember, config.roles.medals.category_first_role.season, 2, medals.season);
	
	if (discordMember.roles.cache.find(role => role.id == config.roles.guildleader) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.guildmaster) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.afk) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.newbie) != null) return;
	if (discordMember.roles.cache.find(role => role.id == config.roles.guest) != null) return;

	var sum = SumMedals(discordMember, medals);
	CheckAndProcessRole	(discordMember, config.roles.guardians[0], sum >=  0, sum >=  7);
	CheckAndProcessRole	(discordMember, config.roles.guardians[1], sum >=  7, sum >= 16);
	CheckAndProcessRole	(discordMember, config.roles.guardians[2], sum >= 16, sum >= 24);
	CheckAndProcessRole	(discordMember, config.roles.guardians[3], sum >= 24, false);
}