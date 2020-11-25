import Discord from "discord.js";
import config from "./config.json";
import * as BungieApi from "./bungieApi.js";
import { FindMemberByFullName } from "./clan.js";

//var iconv = require('iconv-lite');

// redundant
export function roles_bytag (channel, battleTag, sync) {

	if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);

	if(found_member == null){
		console.log("Check in Database;");
		pool.getConnection(function(err, connection) {
			if (err) throw err; // not connected!
			
			var query2 = connection.query('SELECT * FROM members WHERE id = ?',  discord_id, function(err, results, fields) {
				if (err) throw err;
				else {
					if(results.length > 0){
						results.forEach(function (line){
							if (line.membershipId == null) channel.send('Пользователь не найден.');
							else roles(channel, line.membershipType, line.membershipId, d_member.displayName, null);
						});
					}else{
						channel.send('Пользователь не найден.');
					}
					connection.release();
				}
			});
		});								
	}else{
		console.log(found_member.destinyUserInfo.LastSeenDisplayName);
		if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);
		roles(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName, "3858144");
	}
}		

// needs refactoring
export function set_clan_roles(channel){
	var xhr_clan = new XMLHttpRequest();
	xhr_clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
	xhr_clan.setRequestHeader("X-API-Key", d2apiKey);
	xhr_clan.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var json = JSON.parse(this.responseText);
			
			var size = 0;
			members = json.Response.results;
			members.forEach(function(member, i, members) { 
				size++;
			});
			
			var xhr_clan1 = new XMLHttpRequest();
			xhr_clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
			xhr_clan1.setRequestHeader("X-API-Key", d2apiKey);
			xhr_clan1.onreadystatechange = function(){
				if(this.readyState === 4 && this.status === 200){
					var json = JSON.parse(this.responseText);
					
					var size = 0;
					members1 = json.Response.results;
					members1.forEach(function(member, i, members1) {
						members.push(member);
						size++; 
					});
					
					var i = 0;
					
					var check = function(){
						if(i < members.length){
							roles(channel,
									members[i].destinyUserInfo.membershipType, 
									members[i].destinyUserInfo.membershipId, 
									members[i].destinyUserInfo.LastSeenDisplayName, 
									members[i].groupId,
									true);
							i++;
							setTimeout(check, 5000); 
						}
					}
					check();
				}
			}
			xhr_clan1.send();
		}
	}
	xhr_clan.send();
}
// needs refactoring
function CreateSync(channel, discord_id, membershipType, membershipId, LastSeenDisplayName){
	pool.getConnection(function(err, connection) {
		if (err) throw err; // not connected!
		
		var enc_buf = iconv.encode(LastSeenDisplayName, 'cp1251')[0] == 0x3f ?
					iconv.encode(LastSeenDisplayName, 'cp1253') :
					iconv.encode(LastSeenDisplayName, 'cp1251');
					
		var query = connection.query('UPDATE members SET membershipType=?, membershipId=?, name=? WHERE id = ?', 
									 [membershipType, 
									  membershipId, 
									  enc_buf, 
									  discord_id], 
													function(err, result) {
			if (err) throw err;
			else {
				console.log(new Date() + " Free: "+pool._freeConnections.length + "; " + LastSeenDisplayName + " synched");
				connection.release();
				
				pool.getConnection(function(err, connection) {
					if (err) throw err; // not connected!
					var query2 = connection.query('SELECT * FROM members WHERE id = ?',  discord_id, function(err, results, fields) {
						if (err) throw err;
						else {
							results.forEach(function (line){
								var buffer = Buffer.from( line.name, 'binary' );
								console.log(line);
								var i = buffer.indexOf(0x00);
								channel.send("name: " + iconv.decode(buffer, line.membershipId == '4611686018484533589' ? 'cp1253' : 'cp1251').toString().slice(0, i) + "\n"+
											 "bungie: " + line.membershipType + "/"+ line.membershipId + "\n"+
											 "discord: <@" + line.id + ">" );
							});
							
							
							
							connection.release();
						}
					});
				});
			}
		});
	});
}

export function Roles(message, args){
	if (args.length == 1){
		RolesByDiscordMention(message.channel, message.member.id);
	}else if(args[1].startsWith('id:')){
		RolesByMembershipId(message.channel, args[1]);
	}else{
		RolesByDiscordMention(message.channel, args[1]);
	}
}

export function RolesByDiscordMention(channel, discordMention){
	console.log(discordMention);
	var discordId = discordMention.replace(/\D/g,'');
	var discordMember = channel.guild.members.cache.find(member => member.user.id == discordId);
	if(discordMember == null){
		SendRolesMessage(channel, discordMember);
		return;
	}

	var member = FindMemberByFullName(discordMember.displayName);
	var profileData = member.profile.data;
	var rolesData = GetRolesData(profileData.userInfo.membershipType, profileData.userInfo.membershipId);
	
	console.log(rolesData);
	SendRolesMessage(channel, discordMember, profileData, rolesData);
	SetRoles(discordMember, rolesData.charactersLight, rolesData.medals, clanid, profileData.displayName);
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

function GetRolesData(membershipType, membershipId) {
	var jsondata = BungieApi.GetFullMemberData(membershipType, membershipId);
	if(typeof(jsondata.Response.profileRecords.data) == 'undefined') return null;
	
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
	var charactersLight = get_character_light(jsondata);
	
	if(charactersLight.titan == -1 && charactersLight.titan == -1 && charactersLight.titan == -1) return {charactersLight: charactersLight, medals: null};

	//				ROLES
	var characterPresentationNodes = [];
	var characterRecords = [];
	var characterProgressions = [];
	var characterCollectibles = [];
	for (var characterID in jsondata.Response.characterPresentationNodes.data) characterPresentationNodes.push([characterID, jsondata.Response.characterPresentationNodes.data[characterID]]);
	for (var characterID in jsondata.Response.characterRecords.data) characterRecords.push([characterID, jsondata.Response.characterRecords.data[characterID]]);
	for (var characterID in jsondata.Response.characterProgressions.data) characterProgressions.push([characterID, jsondata.Response.characterProgressions.data[characterID]]);
	for (var characterID in jsondata.Response.characterProgressions.data) characterCollectibles.push([characterID, jsondata.Response.characterCollectibles.data[characterID]]);
	
	data.raids.lw  = BungieApi.get_node_data(jsondata, 1525933460, "ПЖ");
	data.raids.gos = BungieApi.get_node_data(jsondata,  615240848, "CC");
	data.raids.dsc = BungieApi.get_node_data(jsondata, 1726708384, "СГК");
	data.raids.day1 = BungieApi.get_day_one(jsondata, characterCollectibles);
	data.locations.dc   = BungieApi.get_node_data(jsondata, 3483405511, "Город Грез");
	data.locations.moon = BungieApi.get_node_data(jsondata, 1473265108, "Луна");
	data.locations.euro = BungieApi.get_node_data(jsondata, 2647590440, "Европа");
	data.triumphs.t10k = BungieApi.get_profile_records(jsondata, "activeScore", 10000, "");
	data.triumphs.t15k = BungieApi.get_profile_records(jsondata, "activeScore", 15000, "");
	data.triumphs.t20k = BungieApi.get_profile_records(jsondata, "activeScore", 20000, "");
	data.seals.cursebreaker = BungieApi.get_character_node_data(characterPresentationNodes, 560097044, "Гроза");
	data.seals.harbinger = BungieApi.get_node_data(jsondata, 379405979, "Посланник");
	data.seals.splintered = BungieApi.get_node_data(jsondata, 79180995, "Раскол");
	data.seals.dredgen = BungieApi.get_node_data(jsondata, 3665267419, "Дреджен");
	data.seals.conqueror = BungieApi.get_any_of_data(characterPresentationNodes, [3212358005, 1376640684], "Завоеватель");
	data.crucible.glory2100 = BungieApi.get_character_progression_data(characterProgressions, 2000925172, 2100, "Ранкед");
	data.crucible.glory3500 = BungieApi.get_character_progression_data(characterProgressions, 2000925172, 3500, "Ранкед");
	data.crucible.glory5450 = BungieApi.get_character_progression_data(characterProgressions, 2000925172, 5450, "Ранкед");
	data.crucible.flawless = BungieApi.get_any_of_data(characterPresentationNodes, [3251218484, 2086100423, 1276693937], "Безупречный");
	data.legacy_seals.lore = BungieApi.get_character_node_data(characterPresentationNodes, 3680676656, "Летописец");
	data.legacy_seals.blacksmith = BungieApi.get_character_node_data(characterPresentationNodes, 450166688, "Кузнец");
	data.legacy_seals.reconeer = BungieApi.get_character_node_data(characterPresentationNodes, 2978379966, "Вершитель");
	data.legacy_seals.shadow = BungieApi.get_character_node_data(characterPresentationNodes, 717225803, "Тень");
	data.legacy_triumphs.t80k = BungieApi.get_profile_records(jsondata, "legacyScore", 80000, "");
	data.legacy_triumphs.t100k = BungieApi.get_profile_records(jsondata, "legacyScore", 100000, "");
	data.legacy_triumphs.t120k = BungieApi.get_profile_records(jsondata, "legacyScore", 120000, "");
	data.season.seal = BungieApi.get_character_node_data(characterPresentationNodes, 1321008463, "Смотритель");
	data.season.triumphs = BungieApi.get_season_triumphs(jsondata, characterPresentationNodes, 2255100699, 
		[91071118,1951157616,4186991151,3518211070,975308347,25634498], "Триумфы");
	data.extra.poi = BungieApi.get_poi(jsondata);
	data.extra.solo = BungieApi.get_all_nodes(jsondata, [3841336511, 3899996566]);
	data.extra.soloflawless = BungieApi.get_all_nodes(jsondata, [3950599483, 3205009787]);
	
	return {charactersLight: charactersLight, medals: data};
}
function SetRoles(discord_member, charactersLight, medals, clanid, displayName){
	LogRolesGranting(displayName, discord_member != null, medals);
	try{
		if(discord_member == null) return;
		 
		checkAndProcessRole(discord_member, config.roles.separators.clanname, true, false);
		checkAndProcessRole(discord_member, config.roles.clans[0], clanid == config.clans[0].id, false);
		checkAndProcessRole(discord_member, config.roles.clans[1], clanid == config.clans[1].id, false);
		checkAndProcessRole(discord_member, config.roles.separators.characters, true, false);
		checkAndProcessRole(discord_member, config.roles.characters.warlock, charactersLight.warlock >= config.minimal_light, false);
		checkAndProcessRole(discord_member, config.roles.characters.hunter, charactersLight.hunter >= config.minimal_light, false);
		checkAndProcessRole(discord_member, config.roles.characters.titan, charactersLight.titan >= config.minimal_light, false);
		checkAndProcessRole(discord_member, config.roles.separators.medals, true, false);
		checkAndProcessRole(discord_member, config.roles.separators.footer, true, false);
		
		if (discord_member.roles.find(role => role.id == config.roles.no_medals) != null) return;
		if (medals == null) return;

		checkAndProcessRole(discord_member, config.roles.medals.specific.day1, medals.raids.day1.state, false);
		checkAndProcessRole(discord_member, config.roles.medals.specific.solo, medals.extra.solo.state, medals.extra.soloflawless.state);
		checkAndProcessRole(discord_member, config.roles.medals.specific.soloflawless, medals.extra.soloflawless.state, false);
		checkAndProcessRole(discord_member, config.roles.medals.specific.poi, medals.extra.poi.state, false);

		checkAndProcessRoleBlock(discord_member, config.roles.medals.category_first_role.raids, 4, medals.raids);
		checkAndProcessRoleBlock(discord_member, config.roles.medals.category_first_role.seals, 5, medals.seals);
		checkAndProcessRoleBlock(discord_member, config.roles.medals.category_first_role.legacy_seals, 4, medals.legacy_seals);
		checkAndProcessRoleBlock(discord_member, config.roles.medals.category_first_role.locations, 3, medals.locations);
		checkAndProcessRoleBlock(discord_member, config.roles.medals.category_first_role.triumphs, 3, medals.triumphs);
		checkAndProcessRoleBlock(discord_member, config.roles.medals.category_first_role.legacy_triumphs, 3, medals.legacy_triumphs);
		checkAndProcessRoleBlock(discord_member, config.roles.medals.category_first_role.season, 2, medals.season);
		
		if (discord_member.roles.find(role => role.id == config.roles.guildleader) != null) return;
		if (discord_member.roles.find(role => role.id == config.roles.guildmaster) != null) return;
		if (discord_member.roles.find(role => role.id == config.roles.afk) != null) return;
		if (discord_member.roles.find(role => role.id == config.roles.newbie) != null) return;
		if (discord_member.roles.find(role => role.id == config.roles.guest) != null) return;

		var sum = sumMedals(discord_member, medals);
		checkAndProcessRole	(discord_member, config.roles.guardians[0], sum >=  0, sum >=  7);
		checkAndProcessRole	(discord_member, config.roles.guardians[1], sum >=  7, sum >= 16);
		checkAndProcessRole	(discord_member, config.roles.guardians[2], sum >= 16, sum >= 24);
		checkAndProcessRole	(discord_member, config.roles.guardians[3], sum >= 24, false);
	}catch(e){
		require('./catcherror').catcherror(e, discord_member.client);
	}
}
function SendRolesMessage(channel, discordMember, profileData, rolesData){
	if(discordMember == null) {
		channel.send('Дискорд профиль не найден.');
	}
	if(rolesData == null) {
		channel.send('Игровой профиль не найден.');
	}else if(rolesData.medals == null) {
		channel.send('Данные профиля не были получены. Вероятно профиль закрыт настройками приватности.\n'+
					 'Настройки приватности: https://www.bungie.net/ru/Profile/Settings/?category=Privacy');
	}else{
		const embed = new Discord.MessageEmbed()
			.setAuthor(profileData.userInfo.displayName + " 💠" + sumMedals(discordMember, rolesData.medals) + "💠")
			.setColor(0x00AE86)
			.setFooter("ПВП медали выдают гм-ы; ранжирование ролей: 7/16/24 • id: "+discordId, "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
			.addField("Рейды",    			form_field(rolesData.medals.raids), true)
			.addField("Печати",   			form_field(rolesData.medals.seals), true)
			.addField("Наследные печати", 	form_field(rolesData.medals.legacy_seals), true)
			.addField("Планеты",  			form_field(rolesData.medals.locations), true)
			.addField("Триумфы",  			form_field(rolesData.medals.triumphs), true)
			.addField("Наследные триумфы", 	form_field(rolesData.medals.legacy_triumphs), true)
			.addField("Горнило",  			form_field(rolesData.medals.crucible), true)
			.addField("Сезон 12",			form_field(rolesData.medals.season), true)
			.addField('\u200B', '\u200B', true)
	        .addField("Ссылки", "[Raid Report](https://raid.report/pc/"+profileData.userInfo.membershipId+")"
							+" | [Braytech](https://beta.braytech.org/"+profileData.userInfo.membershipType+"/"+profileData.userInfo.membershipId+"/"+profileData.characterIds[0]+"/)"
							+" | [D2 Checklist](https://www.d2checklist.com/"+profileData.userInfo.membershipType+"/"+profileData.userInfo.membershipId+"/triumphs)"
							+" | [Destiny Tracker](https://destinytracker.com/destiny-2/profile/steam/"+profileData.userInfo.membershipId+"/overview)")
		channel.send({embed});
	}
}
function LogRolesGranting(displayName, isDiscordMemberFound, medals){
	if(medals == null){
		console.log(displayName + ' '.repeat(48-displayName.length), "NO DATA");
	}else if(isDiscordMemberFound == false){
		console.log(displayName + ' '.repeat(40-displayName.length), "DISCORD MEMBER NOT FOUND");
	}else{
		console.log(displayName + ' '.repeat(40-displayName.length), "set roles and it's details");
	}
}

function checkAndProcessRole(discord_member, roleId, medal, medalNext, role){
	if (role == null) role = discord_member.guild.roles.cache.find(r => r.id == roleId);
	if (role == null) return;
	if(discord_member.roles.cache.find(r => r.position == role.position) == null){
		if(medal == true && medalNext == false){
			discord_member.roles.add(role);
		}
	}else{
		if(medal == false || medalNext == true) {
			discord_member.roles.remove(role);
		}
	}
}
function checkAndProcessRoleBlock(discord_member, firstRoleId, blockSize, data){
	var role = discord_member.guild.roles.find(r => r.id == firstRoleId);
	if (role == null) return;

	var i = 0;
	var sum = sumSubcategory(data);
	while (i < blockSize) {
		var nextRole = discord_member.guild.roles.find(r => r.position == (role.position - i));
		checkAndProcessRole(discord_member, null, sum > i, sum > i+1, nextRole);
		i++;
	}
};

function sumMedals(discord_member, medals){
	var sum = 0;
	for (subcategoryName of Object.keys(medals)) {
		if(subcategoryName != "crucible" && subcategoryName != "extra") sum = sum + sumSubcategory(medals[subcategoryName]);
	};
	return sum + sumCrucible(discord_member);
}
function sumSubcategory(subcategory){
	var sum = 0;
	for (child of Object.values(subcategory)) {
		sum = sum + (child.state?1:0);
	};
	return sum;
}
function sumCrucible(discord_member){
	if (discord_member == null) return 0;
	var pvp_top_role = discord_member.guild.roles.cache.find(role => role.id == config.roles.medals.category_first_role.crucible);
	return  (discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - 0)) != null ? 3 : 0) + 
			(discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - 1)) != null ? 1 : 0) + 
			(discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - 2)) != null ? 2 : 0) +  
			(discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - 3)) != null ? 3 : 0) +
			(discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - 4)) != null ? 2 : 0) + 
			(discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - 5)) != null ? 3 : 0) +  
			(discord_member.roles.cache.find(role => role.position == (pvp_top_role.position - 6)) != null ? 4 : 0);
}

function form_field(data){
	var field = "";
	for (child of Object.values(data)) {
		field = field + "\n" + form_line(child);
	};
	return field;
}
function form_line(data){
	try{
		return (data.state ? "🔶 " : "🔷 ") + data.text;
	}catch{
		return "🔷 not defined";
	}
}