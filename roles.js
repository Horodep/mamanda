var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const Discord = require("discord.js");
const keys = require('./keys');
var numeral = require('numeral');
var iconv = require('iconv-lite');
var d2apiKey = keys.d2apiKey();

const mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit : 10,
	host     : '127.0.0.1',
	user     : 'horodep',
	password : 'sql12345',
	database : 'auroras',
	charset  : 'utf8'
});


var bot_msg;
var minlight = 1041;

exports.roles_bytag = function(channel, battleTag, sync) {
	if(battleTag.startsWith("id:")){
		var steam_id = battleTag.replace(/\D/g,'');
		var discord_id = null;
		console.log(discord_id);
		var d_member = null;
		
		roles(channel, 3, steam_id, null, "-", false);
		
	}else{
		var discord_id = battleTag.replace(/\D/g,'');
		console.log(discord_id);
		var d_member = channel.guild.members.find(member => member.user.id == discord_id);
		
		if(d_member == null){
			channel.send('Дискорд пользователь не найден.');
			return;
		}
		
		console.log("Check in Penumbra;");
		var clan = new XMLHttpRequest();
		clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
		clan.setRequestHeader("X-API-Key", d2apiKey);
		clan.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
			
				var found_member = null;
				var members = json.Response.results;
				members.forEach(function(member) { 
					if(d_member.displayName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") || d_member.displayName == member.destinyUserInfo.LastSeenDisplayName){
						found_member = member;
					}
				});
				
				if(found_member != null){
					console.log(found_member.destinyUserInfo.LastSeenDisplayName);
					if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);
					roles(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName, "3055823");
				}else{
					console.log("Check in Antumbra;");
					var clan1 = new XMLHttpRequest();
					clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
					clan1.setRequestHeader("X-API-Key", d2apiKey);
					clan1.onreadystatechange = function(){
						if(this.readyState === 4 && this.status === 200){
							var json = JSON.parse(this.responseText);
						
							var members1 = json.Response.results;
							members1.forEach(function(member) { 
								if(d_member.displayName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") || d_member.displayName == member.destinyUserInfo.LastSeenDisplayName){
									found_member = member;
								}
							});
							
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
					}
					clan1.send();
				}
			}
		}
		clan.send();
	}
}				

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

function roles(channel, membershipType, membershipId, displayName, clanid, doNotMessage) {
	var fulldata = new XMLHttpRequest();
	fulldata.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Profile/"+membershipId+"/?components=Profiles,Characters,CharacterProgressions,PresentationNodes,Records,Collectibles", true);
	fulldata.setRequestHeader("X-API-Key", d2apiKey);
	fulldata.onreadystatechange = function(){
		if(this.readyState === 4 && this.status === 200){
			var jsondata = JSON.parse(this.responseText);
						
			if(typeof(jsondata.Response.profileRecords.data) == 'undefined'){
				console.log(displayName + ' '.repeat(48-displayName.length), "NO DATA");
				if(!doNotMessage) channel.send('Данные профиля не были получены. Профиль закрыт настройками приватности.\n'+
											   'Настройки приватности: https://www.bungie.net/ru/Profile/Settings/?category=Privacy');
			}else{
				if (displayName == null) displayName = jsondata.Response.profile.data.userInfo.displayName;
				
				console.log(displayName + ' '.repeat(40-displayName.length), "start roles");
				var d_member = channel.guild.members.find(member => member.displayName.startsWith(displayName + " "));
				if (d_member == null) d_member = channel.guild.members.find(member => member.displayName == displayName);
				
				var characterIds = jsondata.Response.profile.data.characterIds;
				var characters = jsondata.Response.characters.data;
				
				var titan = -1;
				var hunter = -1;
				var warlock = -1;
				
				characterIds.forEach(function(characterId){
					switch(characters[characterId].classType){
						case 0:
							titan = characters[characterId].light;
							break;
						case 1:
							hunter = characters[characterId].light;
							break;
						case 2:
							warlock = characters[characterId].light;
							break;
					}
				});
				
				if(titan == -1 && hunter == -1 && warlock == -1) return;

				//				ROLES
				var characterPresentationNodes = [];
				for (var characterID in jsondata.Response.characterPresentationNodes.data) characterPresentationNodes.push([characterID, jsondata.Response.characterPresentationNodes.data[characterID]]);
				
				var characterRecords = [];
				for (var characterID in jsondata.Response.characterRecords.data) characterRecords.push([characterID, jsondata.Response.characterRecords.data[characterID]]);
				
				var characterProgressions = [];
				for (var characterID in jsondata.Response.characterProgressions.data) characterProgressions.push([characterID, jsondata.Response.characterProgressions.data[characterID]]);
				
				var characterCollectibles = [];
				for (var characterID in jsondata.Response.characterProgressions.data) characterCollectibles.push([characterID, jsondata.Response.characterCollectibles.data[characterID]]);
				
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
				
				data.raids.lw  = get_node_data(jsondata, 1525933460, "ПЖ");
				data.raids.gos = get_node_data(jsondata,  615240848, "CC");
				data.raids.dsc = get_node_data(jsondata, 1726708384, "СГК");
				data.raids.day1 = get_day_one(jsondata, characterCollectibles);
				data.locations.dc   = get_node_data(jsondata, 3483405511, "Город Грез");
				data.locations.moon = get_node_data(jsondata, 1473265108, "Луна");
				data.locations.euro = get_node_data(jsondata, 2647590440, "Европа");
				data.triumphs.t10k = get_profile_records(jsondata, "activeScore", 10000, "");
				data.triumphs.t15k = get_profile_records(jsondata, "activeScore", 15000, "");
				data.triumphs.t20k = get_profile_records(jsondata, "activeScore", 20000, "");
				data.seals.cursebreaker = get_character_node_data(characterPresentationNodes, 560097044, "Гроза");
				data.seals.harbinger = get_node_data(jsondata, 379405979, "Посланник");
				data.seals.splintered = get_node_data(jsondata, 79180995, "Раскол");
				data.seals.dredgen = get_node_data(jsondata, 3665267419, "Дреджен");
				data.seals.conqueror = get_any_of_data(characterPresentationNodes, [3212358005, 1376640684], "Завоеватель");
				data.crucible.glory2100 = get_character_progression_data(characterProgressions, 2000925172, 2100, "Ранкед");
				data.crucible.glory3500 = get_character_progression_data(characterProgressions, 2000925172, 3500, "Ранкед");
				data.crucible.glory5450 = get_character_progression_data(characterProgressions, 2000925172, 5450, "Ранкед");
				data.crucible.flawless = get_any_of_data(characterPresentationNodes, [3251218484, 2086100423, 1276693937], "Безупречный");
				data.legacy_seals.lore = get_character_node_data(characterPresentationNodes, 3680676656, "Летописец");
				data.legacy_seals.blacksmith = get_character_node_data(characterPresentationNodes, 450166688, "Кузнец");
				data.legacy_seals.reconeer = get_character_node_data(characterPresentationNodes, 2978379966, "Вершитель");
				data.legacy_seals.shadow = get_character_node_data(characterPresentationNodes, 717225803, "Тень");
				data.legacy_triumphs.t80k = get_profile_records(jsondata, "legacyScore", 80000, "");
				data.legacy_triumphs.t100k = get_profile_records(jsondata, "legacyScore", 100000, "");
				data.legacy_triumphs.t120k = get_profile_records(jsondata, "legacyScore", 120000, "");
				data.season.seal = get_character_node_data(characterPresentationNodes, 1321008463, "Смотритель");
				data.season.triumphs = get_season_triumphs(jsondata, characterPresentationNodes, 2255100699, 
					[91071118,1951157616,4186991151,3518211070,975308347,25634498], "Триумфы");
				data.extra.poi = get_poi(jsondata);
				data.extra.solo = get_all_nodes(jsondata, [3841336511, 3899996566]);
				data.extra.soloflawless = get_all_nodes(jsondata, [3950599483, 3205009787]);
				
				if(!doNotMessage){
					console.log(data);
					const embed = new Discord.RichEmbed()
						  .setAuthor(displayName + " 💠" + sumMedals(d_member, data) + "💠")
						  .setColor(0x00AE86)
						  .setFooter("ПВП медали выдают гм-ы; ранжирование ролей: 7/16/24 • id: "+d_member.user.id, "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
						  .addField("Рейды",    form_field(data.raids), true)
						  .addField("Печати",   form_field(data.seals), true)
						  .addField("Наследные печати", form_field(data.legacy_seals), true)
						  .addField("Планеты",  form_field(data.locations), true)
						  .addField("Триумфы",  form_field(data.triumphs), true)
						  .addField("Наследные триумфы", form_field(data.legacy_triumphs), true)
						  .addField("Горнило",  form_field(data.crucible), true)
						  .addField("Сезон 12", form_field(data.season), true)
						  .addField('\u200B', '\u200B', true)
					embed.addField("Ссылки", "[Raid Report](https://raid.report/pc/"+membershipId+")"
											+" | [Braytech](https://beta.braytech.org/"+membershipType+"/"+membershipId+"/"+characterIds[0]+"/)"
											+" | [D2 Checklist](https://www.d2checklist.com/"+membershipType+"/"+membershipId+"/triumphs)"
											+" | [Destiny Tracker](https://destinytracker.com/destiny-2/profile/steam/"+membershipId+"/overview)")
					channel.send({embed});
				}
				setRoles(d_member, { "titan": titan, "hunter": hunter, "warlock": warlock }, data, clanid, displayName);
			}
		}
	}
	fulldata.send();
}

function check_role(discord_member, position, dontHasRole, medal, medalNext, title){
	if(dontHasRole){
		if(medal == true) {
			if(medalNext == true){
				//console.log("don't do any with "+title);
			}else{
				discord_member.addRole(discord_member.guild.roles.find(role => role.position == position));
				//console.log("add role "+title);
			}
		}else{
			//console.log("don't do any with "+title);
		}
	}else{
		if(medal == false || medalNext == true) {
			//console.log("remove role "+title);
			discord_member.removeRole(discord_member.guild.roles.find(role => role.position == position));
			
		}
		//else console.log("don't do any with "+title);
	}
}

function setRoles(discord_member, charactersLight, medals, clanid, displayName){
	try{
		if(discord_member == null){
			console.log(displayName + ' '.repeat(40-displayName.length), "DISCORD MEMBER NOT FOUND");
			return;
		}
		console.log(displayName + ' '.repeat(40-displayName.length), "set roles");
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
		checkAndProcessRole(discord_member, roles.poi, medals.extra.poi.state, false, "process poi");
		
		if (discord_member.roles.find(role => role.name.includes("frozen")) != null) return;
		
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

function checkAndProcessRole(discord_member, role, medal, medalNext, title){
	if(discord_member.roles.find(r => r.position == role.position) == null){
		if(medal == true && medalNext == false){
			discord_member.addRole(role);
		}
	}else{
		if(medal == false || medalNext == true) {
			discord_member.removeRole(role);
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

function get_node_data(jsondata, recordHash, textprefix){
	try{
		return{
			state: 
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].progressValue >= 
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].completionValue,
			text:
				textprefix + ": " + 
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].progressValue + "/" +
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].completionValue
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}
function get_character_node_data(characterPresentationNodes, recordHash, textprefix){
	try{
		return{
			state: 
				characterPresentationNodes[0][1].nodes[recordHash].progressValue >= 
				characterPresentationNodes[0][1].nodes[recordHash].completionValue,
			text:
				textprefix + ": " + 
				characterPresentationNodes[0][1].nodes[recordHash].progressValue + "/" +
				characterPresentationNodes[0][1].nodes[recordHash].completionValue
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}
function get_character_progression_data(characterProgressions, recordHash, neededValue, textprefix){
	try{
		return{
			state: 
				characterProgressions[0][1].progressions[recordHash].currentProgress >= neededValue,
			text:
				(textprefix == "" ? "" : textprefix + ": " ) + 
				characterProgressions[0][1].progressions[recordHash].currentProgress + "/" + neededValue
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}
function get_any_of_data(characterPresentationNodes, recordHashArray, textprefix){
	var data;
	for (recordHash of recordHashArray){
		data = get_character_node_data(characterPresentationNodes, recordHash, textprefix);
		if (data.state) return data;
	}
	return data;
}
function get_profile_records(jsondata, dataname, neededValue, textprefix){
	try{
		return{
			state: 
				jsondata.Response.profileRecords.data[dataname] >= neededValue,
			text:
				(textprefix == "" ? "" : textprefix + ": " ) + 
				jsondata.Response.profileRecords.data[dataname] + "/" + (neededValue/1000) + "k"
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}
function get_season_triumphs(jsondata, characterPresentationNodes, nodeHash, ignoredRecordHashArray, textprefix){
	try{
		var ignored = 0;
		for (ignoredRecordHash of ignoredRecordHashArray){
			ignored = ignored + ((jsondata.Response.profileRecords.data.records[ignoredRecordHash].state == 67) ? 0 : 1);
		}
		return{
			state: 
				characterPresentationNodes[0][1].nodes[nodeHash].currentProgress == 
				characterPresentationNodes[0][1].nodes[nodeHash].completionValue - ignored
				&& characterPresentationNodes[0][1].nodes[nodeHash].completionValue > 0,
			text:
				(textprefix == "" ? "" : textprefix + ": " ) + 
				characterPresentationNodes[0][1].nodes[nodeHash].progressValue + "/" + 
				(characterPresentationNodes[0][1].nodes[nodeHash].completionValue - ignored)
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}
function get_day_one(jsondata, characterCollectibles){
	try{
		return{
			state: 
				jsondata.Response.profileCollectibles.data.collectibles[2273453972].state%2 != 1 &&
				characterCollectibles[0][1].collectibles[3938759711].state%2 != 1 &&
				jsondata.Response.profileCollectibles.data.collectibles[3171386140].state%2 != 1 &&
				jsondata.Response.profileCollectibles.data.collectibles[1171206947].state%2 != 1,
			text: "Day1: " +
				(jsondata.Response.profileCollectibles.data.collectibles[2273453972].state%2 != 1 ? "СГК " : "") + 
				(characterCollectibles[0][1].collectibles[3938759711].state%2 != 1 ? "СС " : "") + 
				(jsondata.Response.profileCollectibles.data.collectibles[3171386140].state%2 != 1 ? "КС " : "") + 
				(jsondata.Response.profileCollectibles.data.collectibles[1171206947].state%2 != 1 ? "ПЖ " : "")
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: "Day1: not defined"
		}
	}
}
function get_all_nodes(jsondata, recordHashArray, textprefix){
	var counter = 0;
	for (recordHash of recordHashArray){
		counter = counter + (jsondata.Response.profileRecords.data.records[recordHash].state == 67 ? 1 : 0);
	}
	return {
		state: 
			counter == recordHashArray.length,
		text: textprefix + ": " + counter + "/" + recordHashArray.length
	};
}
function get_poi(jsondata){
	try{
		return{
			state: 
				((jsondata.Response.profileRecords.data.records[3448775736].state == 67 ? 1 : 0) + 
				(jsondata.Response.profileRecords.data.records[3804486505].state == 67 ? 1 : 0) + 
				(jsondata.Response.profileRecords.data.records[3185876102].state == 67 ? 1 : 0)) < 3,
			text: ""
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{	state: false, text: ""	}
	}
}