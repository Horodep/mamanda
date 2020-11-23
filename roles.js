const Discord = require("discord.js");
import config from "./config.json";
import BungieApi from "./bungieApi.js";

var Clan = require("./clan.js");
var iconv = require('iconv-lite');

// redundant
exports.roles_bytag = function(channel, battleTag, sync) {

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
exports.set_clan_roles = function(channel){
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
	if (args < 1){
		RolesByDiscordMention(message.channel, message.member.id);
	}else if(args[1].StartsWith('id:')){
		RolesByMembershipId(message.channel, args[1]);
	}else{
		RolesByDiscordMention(message.channel, args[1]);
	}
}

export function RolesByDiscordMention(channel, discordMention){
	console.log(discordMention);
	var discordId = discordMention.replace(/\D/g,'');
	var discordMember = channel.guild.members.find(member => member.user.id == discordId);
	if(discordMember == null){
		SendRolesMessage(channel, discordMember);
		return;
	}

	var member = Clan.FindMemberByFullName(discordMember.displayName);
	var profileData = member.profile.data;
	var rolesData = GetRolesData(profileData.userInfo.membershipType, profileData.userInfo.membershipId);
	
	console.log(rolesData);
	SendRolesMessage(channel, discordMember, profileData, rolesData);
	SetRoles(discordMember, rolesData.charactersLight, rolesData.medals, clanid, profileData.displayName);
}

export function RolesByMembershipId(channel, membership){
	var membershipType = membership.replace('id:','').split('/');
	var membershipId = membership.replace('id:','').split('/');

	var discordMember = channel.guild.members.find(member => member.user.id == 000000000000000000000000);

	var rolesData = GetRolesData(membershipType, membershipId);
	
	console.log(rolesData);
	SendRolesMessage(channel, discordMember, profileData, rolesData);

	channel.send('Временно (или нет) не выдает роли.');

	SetRoles(discordMember, rolesData.charactersLight, rolesData.medals, clanid, profileData.displayName);
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

function GetRolesData(membershipType, membershipId) {
	var jsondata = clan.getFullMemberData(membershipType, membershipId);
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
		var roles = get_roles_definition(discord_member.guild);
		 
		checkAndProcessRole(discord_member, roles.clan, true, false, "set clan header");
		checkAndProcessRole(discord_member, roles.penumbra, clanid == "3055823", false, "process penumbra");
		checkAndProcessRole(discord_member, roles.antumbra, clanid == "3858144", false, "process antumbra");
		checkAndProcessRole(discord_member, roles.characters, true, false, "set characters header");
		checkAndProcessRole(discord_member, roles.warlock, charactersLight.warlock >= minlight, false, "process warlock");
		checkAndProcessRole(discord_member, roles.hunter, charactersLight.hunter >= minlight, false, "process hunter");
		checkAndProcessRole(discord_member, roles.titan, charactersLight.titan >= minlight, false, "process titan");
		checkAndProcessRole(discord_member, roles.medals, true, false, "set medals header");
		checkAndProcessRole(discord_member, roles.footer, true, false, "set footer");
		
		if (discord_member.roles.find(role => role.name.includes("frozen")) != null) return;
		if (medals == null) return;

		checkAndProcessRole(discord_member, roles.day1, medals.raids.day1.state, false, "day 1");
		checkAndProcessRoleBlock(discord_member, roles.top_raids, 3, medals.raids);
		checkAndProcessRoleBlock(discord_member, roles.top_seals, 5, medals.seals);
		checkAndProcessRoleBlock(discord_member, roles.top_legacy_seals, 4, medals.legacy_seals);
		checkAndProcessRoleBlock(discord_member, roles.top_locations, 3, medals.locations);
		checkAndProcessRoleBlock(discord_member, roles.top_triumphs, 3, medals.triumphs);
		checkAndProcessRoleBlock(discord_member, roles.top_legacy_triumphs, 3, medals.legacy_triumphs);
		checkAndProcessRoleBlock(discord_member, roles.top_season, 2, medals.season);
		checkAndProcessRole(discord_member, roles.solo, medals.extra.solo.state, medals.extra.soloflawless.state, "solo");
		checkAndProcessRole(discord_member, roles.soloflawless, medals.extra.soloflawless.state, false, "soloflawless");
		checkAndProcessRole(discord_member, roles.poi, medals.extra.poi.state, false, "process poi");

		if (discord_member.roles.find(role => role.name.includes("Келл")) != null) return;
		if (discord_member.roles.find(role => role.name.includes("Инквизиция")) != null) return;
		if (discord_member.roles.find(role => role.name.includes("Returned")) != null) return;
		if (discord_member.roles.find(role => role.name.includes("Страж")) != null) return;
		if (discord_member.roles.find(role => role.name.includes("Незнакомец")) != null) return;

		var sum = sumMedals(discord_member, medals);
		checkAndProcessRole	(discord_member, roles.role_t2, sum >=0, sum > 6, "Страж");
		checkAndProcessRole	(discord_member, roles.role_t3, sum > 6, sum > 15, "Опытный");
		checkAndProcessRole	(discord_member, roles.role_t4, sum > 15, sum > 23, "Ветеран");
		checkAndProcessRole	(discord_member, roles.role_t5, sum > 23, false, "Легенда");
	}catch(e){
		console.log(displayName + ' Ошибка ' + e.name + ":" + e.message + "\n<@149245139389251584> \n" + e.stack);
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

function checkAndProcessRole(discord_member, role, medal, medalNext, title){
	if(discord_member.roles.find(r => r.position == role.position) == null){
		if(medal == true && medalNext == false){
			discord_member.roles.add(role);
		}
	}else{
		if(medal == false || medalNext == true) {
			discord_member.roles.remove(role);
		}
	}
}
function checkAndProcessRoleBlock(discord_member, role, block_size, data){
	var i = 0;
	var sum = sumSubcategory(data);
	while (i < block_size) {
		checkAndProcessRole(discord_member, discord_member.guild.roles.find(r => r.position == (role.position - i)), sum > i, sum > i+1, "");
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
	var pvp_top_role = discord_member.guild.roles.find(role => role.id == 646150826791796739);
	return  (discord_member.roles.find(role => role.position == (pvp_top_role.position - 0)) != null ? 3 : 0) + 
			(discord_member.roles.find(role => role.position == (pvp_top_role.position - 1)) != null ? 1 : 0) + 
			(discord_member.roles.find(role => role.position == (pvp_top_role.position - 2)) != null ? 2 : 0) +  
			(discord_member.roles.find(role => role.position == (pvp_top_role.position - 3)) != null ? 3 : 0) +
			(discord_member.roles.find(role => role.position == (pvp_top_role.position - 4)) != null ? 2 : 0) + 
			(discord_member.roles.find(role => role.position == (pvp_top_role.position - 5)) != null ? 3 : 0) +  
			(discord_member.roles.find(role => role.position == (pvp_top_role.position - 6)) != null ? 4 : 0);
}
function get_roles_definition(guild){
	return {
		role_t1: guild.roles.find(role => role.id == 471046830700888075),
		role_t2: guild.roles.find(role => role.id == 471048548318969888),
		role_t3: guild.roles.find(role => role.id == 471046764800114689),
		role_t4: guild.roles.find(role => role.id == 471043840485097473),
		role_t5: guild.roles.find(role => role.id == 572776313794854940),
		clan: guild.roles.find(role => role.id == 618949527851761674),
		penumbra: guild.roles.find(role => role.id == 618949692935372841),
		antumbra: guild.roles.find(role => role.id == 618949694953095169),
		characters: guild.roles.find(role => role.id == 581016395140300820),
		warlock: guild.roles.find(role => role.id == 581016530322587650),
		hunter: guild.roles.find(role => role.id == 581016534751641601),
		titan: guild.roles.find(role => role.id == 581016532499300353),
		medals: guild.roles.find(role => role.id == 572759260023226379),
		footer: guild.roles.find(role => role.id == 572759337836216330),
		poi: guild.roles.find(role => role.id == 604763831620861992),

		day1: guild.roles.find(role => role.id == 632110262153117706),
		solo: guild.roles.find(role => role.id == 577473336611700756),
		soloflawless: guild.roles.find(role => role.id == 632110696099872768),
		
		top_raids: guild.roles.find(role => role.id == 572759650928164875),
		top_seals: guild.roles.find(role => role.id == 636579093214658563),
		top_legacy_seals: guild.roles.find(role => role.id == 577473317997379584),
		top_locations: guild.roles.find(role => role.id == 646150830533378111),
		top_triumphs: guild.roles.find(role => role.id == 646153691811807240),
		top_legacy_triumphs: guild.roles.find(role => role.id == 572759694607908894),
		top_season: guild.roles.find(role => role.id == 572759686919618561)
	}
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