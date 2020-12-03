import Discord from "discord.js";
import config from "./config.json";
import { GetClanMembers } from "./bungieApi.js";
import { GetShowAndSetRoles } from "./roles.js";
import { ClanMember } from "./clanMember.js";
import { GetClanVoiceSummary } from "./sql.js";

async function GetAllMembers() {
	var members = [];
	Array.prototype.push.apply(members, await GetClanMembers(config.clans[0].id));
	Array.prototype.push.apply(members, await GetClanMembers(config.clans[1].id));
	return members;
}

export async function ClanSize() {
	return config.clans[0].name + ": " + (await GetClanMembers(config.clans[0].id)).length + "\n" +
		config.clans[1].name + ": " + (await GetClanMembers(config.clans[1].id)).length;
}

export async function GetMemberByDiscordName(discordName) {
	var members = await GetAllMembers();
	try {
		members.forEach(function (member) {
			if (discordName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") ||
				discordName == member.destinyUserInfo.LastSeenDisplayName) {
				throw member;
			}
		});
	} catch (member) {
		return member;
	}
}

export async function ExecuteForEveryMember(timeout, callback) {
	var members = await GetAllMembers();
	var i = 0;
	var iteration = function () {
		if (i < members.length) {
			callback(members[i], i+1, members);
			i++;
			setTimeout(iteration, timeout);
		}
	}
	iteration();
}

export async function ClanTime(channel) {
	var clanVoiceSummary = await GetClanVoiceSummary(7);
	channel.send("bruh").then((msg)=>{
		ExecuteForEveryMember(200, async function (member, i, members) {
			if(i%10 == 0 || i == members.length){
				msg.edit("bruh "+i+"/"+members.length);
			}
		});
	});
}

export function SetRoles(channel) {
	ExecuteForEveryMember(5000, (member) => {
		var clanMember = new ClanMember(member);
		clanMember.FetchDiscordMember(channel.guild);
		GetShowAndSetRoles(clanMember, null);
	});
}

//var iconv = require('iconv-lite');
/*
const embed = new Discord.RichEmbed()
		.setAuthor("Clankick — request in progress: [00/"+size+"]")
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp()

message.channel.send({embed}).then((msg)=>{
	bot_msg = msg;
});
*/
// redundant
export function database_stuff(channel, battleTag, sync) {

	if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);

	if (found_member == null) {
		console.log("Check in Database;");
		pool.getConnection(function (err, connection) {
			if (err) throw err; // not connected!

			var query2 = connection.query('SELECT * FROM members WHERE id = ?', discord_id, function (err, results, fields) {
				if (err) throw err;
				else {
					if (results.length > 0) {
						results.forEach(function (line) {
							if (line.membershipId == null) channel.send('Пользователь не найден.');
							else roles(channel, line.membershipType, line.membershipId, d_member.displayName, null);
						});
					} else {
						channel.send('Пользователь не найден.');
					}
					connection.release();
				}
			});
		});
	} else {
		console.log(found_member.destinyUserInfo.LastSeenDisplayName);
		if (sync == true) CreateSync(channel, discord_id, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName);
		roles(channel, found_member.destinyUserInfo.membershipType, found_member.destinyUserInfo.membershipId, found_member.destinyUserInfo.LastSeenDisplayName, "3858144");
	}
}
// needs refactoring
function CreateSync(channel, discord_id, membershipType, membershipId, LastSeenDisplayName) {
	pool.getConnection(function (err, connection) {
		if (err) throw err; // not connected!

		var enc_buf = iconv.encode(LastSeenDisplayName, 'cp1251')[0] == 0x3f ?
			iconv.encode(LastSeenDisplayName, 'cp1253') :
			iconv.encode(LastSeenDisplayName, 'cp1251');

		var query = connection.query('UPDATE members SET membershipType=?, membershipId=?, name=? WHERE id = ?',
			[membershipType,
				membershipId,
				enc_buf,
				discord_id],
			function (err, result) {
				if (err) throw err;
				else {
					console.log(new Date() + " Free: " + pool._freeConnections.length + "; " + LastSeenDisplayName + " synched");
					connection.release();

					pool.getConnection(function (err, connection) {
						if (err) throw err; // not connected!
						var query2 = connection.query('SELECT * FROM members WHERE id = ?', discord_id, function (err, results, fields) {
							if (err) throw err;
							else {
								results.forEach(function (line) {
									var buffer = Buffer.from(line.name, 'binary');
									console.log(line);
									var i = buffer.indexOf(0x00);
									channel.send("name: " + iconv.decode(buffer, line.membershipId == '4611686018484533589' ? 'cp1253' : 'cp1251').toString().slice(0, i) + "\n" +
										"bungie: " + line.membershipType + "/" + line.membershipId + "\n" +
										"discord: <@" + line.id + ">");
								});



								connection.release();
							}
						});
					});
				}
			});
	});
}
/*
exports.clantime = function(message, days, clantype, auto) {
	var voice_online = {};
	getVoiceTime(days, voice_online);
	
	var allroles = [
		message.guild.roles.find(role => role.id == 590079280575283211),
		message.guild.roles.find(role => role.id == 471039282627346432),
		message.guild.roles.find(role => role.id == 596724711782613002),
		message.guild.roles.find(role => role.id == 572776313794854940),
		message.guild.roles.find(role => role.id == 471043840485097473),
		message.guild.roles.find(role => role.id == 471046764800114689),
		message.guild.roles.find(role => role.id == 471048548318969888),
		message.guild.roles.find(role => role.id == 471046830700888075),
		message.guild.roles.find(role => role.id == 519980895642583041)];
	
	var bot_msg = message;
	var members;
	var counter = 0;
	var size = 0;
	var c_counter = 0;
	var c_size = 0;
	var errors = 0;
	
	var member_time = [];
	
	var extra_counter = 0;
	var penumbra_counter = 0;
	
	function request_clan(callback) { // 1
		var xhr_clan = new XMLHttpRequest();
		xhr_clan.open("GET", "https://www.bungie.net/Platform/GroupV2/3055823/Members/", true);
		xhr_clan.setRequestHeader("X-API-Key", d2apiKey);
		xhr_clan.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				
				members = json.Response.results;
				members.forEach(function(member, i, members) { size++; });
				penumbra_counter = size;
				
				var xhr_clan1 = new XMLHttpRequest();
				xhr_clan1.open("GET", "https://www.bungie.net/Platform/GroupV2/3858144/Members/", true);
				xhr_clan1.setRequestHeader("X-API-Key", d2apiKey);
				xhr_clan1.onreadystatechange = function(){
					if(this.readyState === 4 && this.status === 200){
						var json = JSON.parse(this.responseText);
						
						members111 = json.Response.results;
						members111.forEach(function(member, i, members111) { 
							//console.log(i);
							size++;
							members.push(member);
						});
						
						const embed = new Discord.RichEmbed()
							  .setAuthor("Clankick — request in progress: [00/"+size+"]")
							  .setColor(0x00AE86)
							  .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
							  .setTimestamp()
						
						message.channel.send({embed}).then((msg)=>{
							bot_msg = msg;
						});
						callback();
					}
				}
				xhr_clan1.send();
			}
		}
		xhr_clan.send();
	}
	
	function handle_members(finalReportData_callback){ // 2
		request_clan(function handleMembersList() {
			var completed = 0;
			var i = 0;
			
			//size = 20; ///////////////////////////////////////////////////////// DEBUG
			
			var check = function(){
				if(i == size){
					
				}
				else {
					member_request(members[i], finalReportData_callback);
					i++;
					setTimeout(check, 500); 
				}
			}

			check();
		})
	}
	
	function member_request(member, finalReportData_callback){
		 ///////////////////////////////////////////////////////// DEBUG
		var membershipType = member.destinyUserInfo.membershipType;
		var membershipId   = member.destinyUserInfo.membershipId;
		var displayName    = member.destinyUserInfo.LastSeenDisplayName;
		 ///////////////////////////////////////////////////////// DEBUG
		
		member_time[membershipId] = new Member(membershipType, membershipId, displayName, 0);
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Profile/"+membershipId+"/?components=Profiles", true);
		xhr.timeout = 5000;
		xhr.setRequestHeader("X-API-Key", d2apiKey);
		xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				var json = JSON.parse(this.responseText);
				if(typeof(json.Response.profile.data) == 'undefined'){
					console.log('name: '+displayName+' id: '+membershipId+' - access closed');
					member_time[membershipId].setAccess(false);
					finalReportData_callback();
				}else{
					var characterIds = json.Response.profile.data.characterIds;
					characterIds.forEach(function(characterId){
						//console.log('c: ['+c_counter+'/'+c_size+'] p: ['+counter+'/'+size+'] '+
						//	membershipId+' characterId: '+characterId+' name: '+member_time[membershipId].displayName );
						c_size++;
						character_page_request(membershipType, membershipId, characterId, 0, finalReportData_callback);
					});
				}
				counter++;
			}else if (this.readyState === 4 && this.status != 200){
				counter++;
				console.log('name: '+displayName+' id: '+membershipId+' - access closed');
				member_time[membershipId].setAccess(false);
				finalReportData_callback();
			}
		}
		xhr.send();
	}
	function character_page_request(membershipType, membershipId, characterId, page, finalReportData_callback){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.bungie.net/Platform/Destiny2/"+membershipType+"/Account/"+membershipId+"/Character/"+characterId+"/Stats/Activities/?mode=None&count=250&page="+page, true);
		xhr.timeout = 5000;
		xhr.setRequestHeader("X-API-Key", d2apiKey);
		xhr.onreadystatechange = function(){
			if(this.readyState === 4 && this.status === 200){
				
				var json = JSON.parse(this.responseText);
				if(json.ErrorCode != 1){
					console.log("err");
				}
				if(typeof(json.Response) == 'undefined' || typeof(json.Response.activities) == 'undefined'){
					c_counter++;
					errors++;
					console.log('c: ['+c_counter+'/'+c_size+'] p: ['+counter+'/'+size+'] '+
								membershipId+' characterId: '+characterId+' page: '+page+' name: '+member_time[membershipId].displayName +' - no actions');
					finalReportData_callback();
				}else{
					var activities = json.Response.activities;
					
					var nextPage = true;
					var delta = new Date();
					delta.setDate(delta.getDate()-days);
					activities.forEach(function(act){
						if(delta <  new Date(act.period)){
							member_time[membershipId].addTime(act.values.timePlayedSeconds.basic.value);
						}else{
							nextPage = false;
						}
					});
					if(nextPage){
						console.log('c: ['+c_counter+'/'+c_size+'] p: ['+counter+'/'+size+'] '+
							membershipId+' characterId: '+characterId+' page: '+page+' name: '+member_time[membershipId].displayName );
						character_page_request(membershipType, membershipId, characterId, page+1, finalReportData_callback);
					}else{
						c_counter++;
						console.log('c: ['+c_counter+'/'+c_size+'] p: ['+counter+'/'+size+'] '+
							membershipId+' characterId: '+characterId+' page: '+page+' name: '+member_time[membershipId].displayName );
						finalReportData_callback();
					}
				}
			}else if (this.readyState === 4 && this.status != 200){
				c_counter++;
				member_time[membershipId].setAccess(false);
				console.log('c: ['+c_counter+'/'+c_size+'] p: ['+counter+'/'+size+'] '+
							membershipId+' characterId: '+characterId+' page: '+member_time[membershipId].displayName +' - HTTP ERROR');
			}
		}
		xhr.send();
	}
	
	handle_members(function finalReportData() {
						
		if(c_counter % 20 == 0 || c_counter == c_size){
			
			var novices = [];
			var less25 = [];
			var less7 = [];
			var game0 = [];
			var voice0 = [];
			var isdown = [];
			var nodata = [];
			var copy = [];			
			var nickbug = [];
			var putnik = [];
			
			for (var key in member_time) {
				var d_member = message.guild.members.find(member => (member.displayName.startsWith(member_time[key].displayName + " ") ||
																	member.displayName == member_time[key].displayName));
				
				if(d_member != null){
					member_time[key].setDiscord(d_member.user.id);
					member_time[key].setDiscordTime(voice_online[d_member.user.id] ? voice_online[d_member.user.id] : 1);
					member_time[key].setInClan(Math.round((Date.now() - d_member.joinedTimestamp)/(1000*60*60*24)));
				}
				
				if(member_time[key].discordId == null){
					nickbug.push(member_time[key]);
				}else if(bot_msg.guild.members
						.find(member => member.id == member_time[key].discordId).roles
						.find(role => role.id == 564787660745605120) != null){
					putnik.push(member_time[key]);
				}else if(bot_msg.guild.members
						.find(member => member.id == member_time[key].discordId).roles
						.find(role => role.id == 519980895642583041) != null){
					isdown.push(member_time[key]);
				}else if(member_time[key].inClan < 7){
					//Меньше недели - все ок!
				}else if(member_time[key].time == 0){
					game0.push(member_time[key]);
				}else if(member_time[key].discordTime == 1){
					voice0.push(member_time[key]);
				}else if(member_time[key].access == false){
					nodata.push(member_time[key]);
				}else if(member_time[key].getPercentage() < 15){
					less25.push(member_time[key]);
				}else if(bot_msg.guild.members
						.find(member => member.id == member_time[key].discordId).roles
						.find(role => role.id == 471046830700888075) == null &&
						member_time[key].time < 60*60*5){
					less7.push(member_time[key]);
				}else if(bot_msg.guild.members
						.find(member => member.id == member_time[key].discordId).roles
						.find(role => role.id == 471046830700888075) != null 
						&& member_time[key].inClan < 10){
					//novices.push(member_time[key]);
				}else if(bot_msg.guild.members
						.find(member => member.id == member_time[key].discordId).roles
						.find(role => role.id == 471046830700888075) != null){
					novices.push(member_time[key]);
				}
			};
			
			copy.sort(function(a, b) {
				return a.time < b.time ? 1 : a.time > b.time ? -1 : 0
			});
			less7.sort(function(a, b) {
				return a.time < b.time ? 1 : a.time > b.time ? -1 : 0
			});
			less25.sort(function(a, b) {
				return a.getPercentage() < b.getPercentage() ? 1 : a.getPercentage() > b.getPercentage() ? -1 : a.time < b.time ? 1 : a.time > b.time ? -1 : 0
			});
			novices.sort(function(a, b) {
				return a.inClan < b.inClan ? 1 : a.inClan > b.inClan ? -1 : 0
			});
			isdown.sort(function(a, b) {
				return a.time < b.time ? 1 : a.time > b.time ? -1 : 0
			});
			game0.sort(function(a, b) {
				return a.discordTime < b.discordTime ? 1 : a.discordTime > b.discordTime ? -1 : 0
			});
			voice0.sort(function(a, b) {
				return a.time < b.time ? 1 : a.time > b.time ? -1 : 0
			});
			nodata.sort(function(a, b) {
				return a.discordTime < b.discordTime ? 1 : a.discordTime > b.discordTime ? -1 : 0
			});
			nickbug.sort(function(a, b) {
				return a.time < b.time ? 1 : a.time > b.time ? -1 : 0
			});
			
			const embed = new Discord.RichEmbed()
			  .setAuthor("Clankick :: " + penumbra_counter + " + " + (size-penumbra_counter) 
										+ " - " + (game0.length + voice0.length) + " = " + size + " - " + (game0.length + voice0.length)
										+ ((c_counter == c_size && counter == size) ? 
										"" : 
										" — request in progress: ["+Math.floor(c_counter/3)+"/"+size+"]["+c_counter+"/"+c_size+"]"))
			  .setColor(0x00AE86)
				
				
			function addEmbed(array, line_type, embed_header, show_if_empty, semicolumn, condition) {
				if (!condition) return;
				var text = show_if_empty ? '\u200B' : "";
				for (var i = 0; i < array.length; i++) {
					var line = createLine(bot_msg, array[i], line_type);
					text += line;
				}
				if(text.length > 0 && text.length < 1024) {
					embed.addField(embed_header, text, semicolumn)
				}else{
					var text1 = "";
					var text2 = "";
					for (var i = 0; i < array.length; i++) {
						var line = createLine(bot_msg, array[i], line_type);
						if (i%2 == 0) text1 += line;
						else text2 += line;
					}
					if(text1.length > 0) embed.addField(embed_header, text1, semicolumn);
					if(text2.length > 0) embed.addField(embed_header, text2, semicolumn);
				}
			}
			
			addEmbed(less7, 	"less7", 			"Меньше 5 часов", 				false,	false, 	clantype == 'full');
			addEmbed(less25, 	null, 				"Меньше 15%", 					false,	false, 	true);
			addEmbed(game0, 	"0 game", 			"0 в игре [в войсе]", 			false,	true, 	true);
			addEmbed(voice0, 	"0 voice", 			"0 в войсе [в игре]", 			false,	true, 	true);
			addEmbed(novices, 	null, 				"Апнуть в стражи", 				true,	false, 	true);
			addEmbed(isdown, 	"is down",			"Guardian is down [в игре]", 	false, 	false, 	clantype == 'full');
			addEmbed(nodata, 	"nodata", 			"Профиль закрыт [в войсе]", 	false,	true, 	clantype == 'full');
			addEmbed(putnik, 	"is down + newline","Недокикнуты [в игре]", 		false,	true, 	true);
			embed.addBlankField();
			addEmbed(nickbug, 	"nickbug", 			"Неверный ник [в игре]", 		false,	true, 	true);
			
			var left = "";
			allroles.forEach(function(role){
				//console.log(role.name);
				role.members.forEach(function(member){	
					var inClan = false;
					for (var key in members) {
						if(member.displayName.startsWith(members[key].destinyUserInfo.LastSeenDisplayName)) inClan = true;
					};
					if (!inClan) left += "<@"+member.user.id+">\n";
				});
			});
			if(left.length > 0) embed.addField("Ливнули/неверный ник", left, true)
	
			embed.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
				 .setTimestamp()
			bot_msg.edit({embed});
			
			if(c_counter == c_size && counter == size){								

				if (auto == true){
					i = 0;
					var sending0 = function(){
						if(i < game0.length){
							var member = bot_msg.client.users.get(game0[i].discordId);
							try {
								var member_message_text = "Последнюю неделю вы не заходили в игру. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n"+
															"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
								console.log("pm "+ game0[i].displayName);
								member.send(member_message_text);
								logging.log(bot_msg.client, "__Игроку <@" + member.id + "> [" + game0[i].displayName + "] отправлено сообщение:__\n" + member_message_text);
							} catch(e) {
								logging.log(bot_msg.client,"<@149245139389251584>\nИгрок <@" + member.id + "> [" + game0[i].displayName + "] отключил ЛС.");
							}
							i++;
							setTimeout(sending0, 2000); 
						}else{
							i = 0;
							var sending = function(){
								if(i < voice0.length){
									var member = bot_msg.client.users.get(voice0[i].discordId);
									try {
										var member_message_text = "Последнюю неделю вы не заходили в голосовые каналы дискорда. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n"+
																	"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
										member.send(member_message_text);
										console.log("pm "+ voice0[i].displayName);
										logging.log(bot_msg.client, "__Игроку <@" + member.id + "> [" + voice0[i].displayName + "] отправлено сообщение:__\n" + member_message_text);
									} catch(e) {
										logging.log(bot_msg.client,"<@149245139389251584>\nИгрок <@" + member.id + "> [" + game0[i].displayName + "] отключил ЛС.");
									}
									i++;
									setTimeout(sending, 2000); 
								}else{
									i = 0;
									var sending1 = function(){
										if(i < less25.length){
											var member = bot_msg.client.users.get(less25[i].discordId);
											try {
												var member_message_text = "Ваше присутсвие в голосовом чате за последнюю неделю составило "+less25[i].getPercentage()+
																			"% от вашего игрового времени. Если в течении недели ситуация не изменится, вас исключат из клана.\n"+
																			"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
												member.send(member_message_text);
												console.log("pm "+ less25[i].displayName);
												logging.log(bot_msg.client, "__Игроку <@" + member.id + "> [" + less25[i].displayName + "] отправлено сообщение:__\n" + member_message_text);
											} catch(e) {
												logging.log(bot_msg.client,"<@149245139389251584>\nИгрок <@" + member.id + "> [" + game0[i].displayName + "] отключил ЛС.");
											}
											i++;
											setTimeout(sending1, 2000); 
										}else{
											
											i = 0;
											var sending2 = function(){
												if(i < less7.length){
													var member = bot_msg.client.users.get(less7[i].discordId);
													var member_message_text = "Ваш онлайн в игре составил "+createLine(bot_msg, less7[i], "solo")+
																				". Если в течении недели ваш онлайн не увеличится, вас исключат из клана.\n"+
																				"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
													member.send(member_message_text);
													console.log("pm "+ less7[i].displayName);
													logging.log(bot_msg.client, "__Игроку <@" + member.id + "> [" + less7[i].displayName + "] отправлено сообщение:__\n" + member_message_text);
													i++;
													setTimeout(sending2, 2000); 
												}
											}
											sending2();
										}
									}
									sending1();
								}
							}
							sending();
						}
					}
					sending0();
				}
			}

		}
	});
}

function getRoleMark(bot_msg, discordId){
	if ( bot_msg.guild.members.find(member => member.id == discordId).roles
							  .find(role => role.id == 471046830700888075) != null) {
										var member = bot_msg.guild.members.find(member => member.id == discordId);
										var days = Math.round((Date.now() - member.joinedTimestamp)/(1000*60*60*24));
										return "📗"+days+"d";
	}
	if ( bot_msg.guild.members.find(member => member.id == discordId).roles
							  .find(role => role.id == 471048548318969888) != null) return "📘";
	if ( bot_msg.guild.members.find(member => member.id == discordId).roles
							  .find(role => role.id == 471046764800114689) != null) return "📒";
	if ( bot_msg.guild.members.find(member => member.id == discordId).roles
							  .find(role => role.id == 471043840485097473) != null) return "📙";
	if ( bot_msg.guild.members.find(member => member.id == discordId).roles
							  .find(role => role.id == 471039282627346432) != null) return "👑";
	if ( bot_msg.guild.members.find(member => member.id == discordId).roles
							  .find(role => role.id == 519980895642583041) != null) return "💤";
	if ( bot_msg.guild.members.find(member => member.id == discordId).roles
							  .find(role => role.id == 596724711782613002) != null) return "🎓";
	return "❌";
}

function createLine(bot_msg, member, mode){
	var hours   = Math.floor(member.time / 3600);
	var minutes = Math.floor((member.time%3600)/60);
	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	
	var d_hours   = Math.floor(member.discordTime / 3600);
	var d_minutes = Math.floor((member.discordTime%3600)/60);
	if (d_hours   < 10) {d_hours   = "0"+d_hours;}
	if (d_minutes < 10) {d_minutes = "0"+d_minutes;}
	
	var percentage = member.getPercentage();
	if (percentage < 100) {percentage = "0"+percentage;}
	if (percentage < 10)  {percentage = "0"+percentage;}
	
	//📗 - green
	//📘 - blue
	//📒 - yellow
	//📙 - orange
	//📕 - red
	
	switch(mode){
		case "nickbug":
			return member.displayName + " (" + hours + ":" + minutes + ")\n";
		case "solo":
			return hours + ":" + minutes;
		case "solotime":
			return d_hours + ":" + d_minutes;
		case "is down + newline":
			return "<@" + member.discordId + "> (`" + hours + ":" + minutes + "`)\n";
		case "is down":
			return "<@" + member.discordId + "> (`" + hours + ":" + minutes + "`) ";
		case "0 voice":
			return "`" + (member.access ? "" + hours + ":" + minutes : "--:--") + getRoleMark(bot_msg, member.discordId) + "`<@" + member.discordId + ">\n";
		case "0 game":
		case "nodata":
			return "`" + d_hours + ":" + d_minutes + "" + getRoleMark(bot_msg, member.discordId) + "`<@" + member.discordId + ">\n";
		case "cc":
			return "`" + (member.access ? hours + ":" + minutes + " " : "--:--") + "` " + " " + member.displayName + "\n";
		default:
			return "`" + percentage + "% " + (member.access ? "" + hours + ":" + minutes + " " : "--:--") + 
					 d_hours + ":" + d_minutes + "" + getRoleMark(bot_msg, member.discordId) + "`<@" + member.discordId + ">\n";
			//return "`" + percentage + "% " + (member.access ? "[" + hours + ":" + minutes + " " : "[--:-- ") + 
			//		 d_hours + ":" + d_minutes + "] " + getRoleMark(bot_msg, member.discordId) + "` " + " <@" + member.discordId + ">\n";
	}
}
*/