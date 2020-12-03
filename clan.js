import { MessageEmbed } from "discord.js";
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
			callback(members[i], i + 1, members);
			i++;
			setTimeout(iteration, timeout);
		}
	}
	iteration();
}

export function SetRoles(channel) {
	ExecuteForEveryMember(5000, (member) => {
		var clanMember = new ClanMember(member);
		clanMember.FetchDiscordMember(channel.guild);
		GetShowAndSetRoles(clanMember, null);
	});
}

export async function ClanTime(channel, days) {
	var clanMembers = [];
	var clanVoiceSummary = await GetClanVoiceSummary(days);
	channel.send("bruh").then((msg) => {
		ExecuteForEveryMember(500, async function (member, i, members) {
			var membershipId = member.destinyUserInfo.membershipId;
			var clanMember = new ClanMember(member);
			await clanMember.FetchCharacterIds();
			clanMember.FetchDiscordMember(message.guild);
			//clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]); // don't work
			var activities = await GetAllActivities(clanMember, days);
			activities.forEach(a => clanMember.AddToGameOnline(a.values.timePlayedSeconds.basic.value))

			clanMembers[membershipId] = clanMember;

			if (i % 20 == 0 || i == members.length) {
				msg.edit(FormClanTimeEmbed(clanMembers, i));
			}
		});
	});
}

function FormClanTimeEmbed(clanMembers, i) {
	const embed = new MessageEmbed()
		.setAuthor("Clankick "+i)
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp()


	var goodNewbie = clanMembers.filter(m => m.HasDiscordRole(config.roles.newbie) && m.joined >= 10).sort(byJoinDate);
	var lowVoice = clanMembers.filter(m => m.percentage < 15).sort(byPercentage);
	var lowGame = clanMembers.filter(m => m.isLowGame).sort(byGameTime);
	var zeroGame = clanMembers.filter(m => m.isZeroGame).sort(byVoiceTime);
	var zeroVoice = clanMembers.filter(m => m.isZeroVoice).sort(byGameTime);
	var isAway = clanMembers.filter(m => m.HasDiscordRole(config.roles.afk)).sort(byGameTime);
	var discordNotFound = clanMembers.filter(m => !m.discordMemberExists).sort(byGameTime);
	var weForgotToKik = clanMembers.filter(m => m.HasDiscordRole(config.roles.guest));
	var noData = clanMembers.filter(m => !m.access).sort(byVoiceTime);

	//       embed | field title | array | pattern | separator | show_if_empty | semicolumn | condition
	addField(embed, "Меньше 5 часов", lowGame, null, "\n", false, false, isFull);
	addField(embed, "Меньше 15%", lowVoice, null, "\n", false, false);
	addField(embed, "0 в игре [в войсе]", zeroGame, "`$voice$role`$tag", "\n", false, true);
	addField(embed, "0 в войсе [в игре]", zeroVoice, "`$game$role`$tag", "\n", false, true);
	addField(embed, "Очернить стража", goodNewbie, null, "\n", true, false);
	addField(embed, "В отпуске [в игре]", isAway, "$tag ($time)", "\n", false, false, isFull);
	addField(embed, "Профиль закрыт [в войсе]", noData, "`$voice$role`$tag", "\n", false, true, isFull);
	addField(embed, "Недокикнуты [в игре]", weForgotToKik, "$name ($time)", "\n", false, true);
	addField(embed, '\u200B', [], "", "", true, false)
	addField(embed, "Неверный ник [в игре]", discordNotFound, "$name ($time)", "\n", false, true);

	var discordMembers = getFullDiscordClanMemberList(clanMembers[0].discordMember.guild);
	var left = "";
	discordMembers.forEach(function (member) {
		if (clanMembers.filter(m => member.displayName.startsWith(m.displayName)).length == 0) {
			left += "<@" + member.user.id + ">\n"
		}
	});
	if (left.length > 0) embed.addField("Неверный ник [в дискорде]", left, true)
	
	function byGameTime(a, b) { return a.gameOnline < b.gameOnline ? 1 : a.gameOnline > b.gameOnline ? -1 : 0;}
	function byVoiceTime(a, b) { return a.voiceOnline < b.voiceOnline ? 1 : a.voiceOnline > b.voiceOnline ? -1 : 0;}
	function byJoinDate(a, b) { return a.joined < b.joined ? 1 : a.joined > b.joined ? -1 : 0;}
	function byPercentage(a, b) { return a.joined < b.joined ? 1 : a.joined > b.joined ? -1 : 0;}
	return embed;
}

function addField(embed, embed_header, members, linePattern, separator, show_if_empty, semicolumn, show) {
	if (!show) return;

	if (members.map(m => createLine(m, linePattern)).join(separator).length > 1010){
		embed.addField(embed_header, members.filter((_,i) => i <  members.length/2).map(m => createLine(m, linePattern)).join(separator), semicolumn);
		embed.addField(embed_header, members.filter((_,i) => i >= members.length/2).map(m => createLine(m, linePattern)).join(separator). semicolumn);
	}else{
		var prefix = show_if_empty ? '\u200B' : "";
		embed.addField(embed_header, prefix + members.map(m => createLine(m, linePattern)).join(separator), semicolumn);
	}
}

function createLine(clanMember, pattern) {
	if (!pattern) pattern = "`$percent $game $voice $role`$tag";
	return pattern
		.replace("$name", clanMember.displayName)
		.replace("$tag", clanMember.discordTag)
		.replace("$role", getRoleMark(clanMember))
		.replace("$game", clanMember.GetGameTimeLine())
		.replace("$voice", clanMember.GetVoiceTimeLine())
		.replace("$percent", clanMember.GetPercentageLine())
}

function getRoleMark(clanMember) {
	if (clanMember.HasDiscordRole(config.roles.newbie)) {
		var days = Math.round((Date.now() - clanMember.discordMember.joinedTimestamp) / (1000 * 60 * 60 * 24));
		return "📗" + days + "d";
	}
	if (clanMember.HasDiscordRole(config.roles.guardians[0])) return "📘";
	if (clanMember.HasDiscordRole(config.roles.guardians[1])) return "📒";
	if (clanMember.HasDiscordRole(config.roles.guardians[2])) return "📙";
	if (clanMember.HasDiscordRole(config.roles.guardians[3])) return "📕";
	if (clanMember.HasDiscordRole(config.roles.guildmaster)) return "👑";
	if (clanMember.HasDiscordRole(config.roles.afk)) return "💤";
	if (clanMember.HasDiscordRole(config.roles.raidleader)) return "🎓";
	return "❌";
}

function getFullDiscordClanMemberList(guild){
	var members = [];
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.guildleader));
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.guildmaster));
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.raidleader));
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.guardians[3]));
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.guardians[2]));
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.guardians[1]));
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.guardians[0]));
	Array.prototype.push.apply(members, guild.roles.cache.find(r => r.id == config.roles.newbie));
	return members;
}

function SendMessages(members) {
	const zeroGame = "Последнюю неделю вы не заходили в игру. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const zeroVoice = "Последнюю неделю вы не заходили в голосовые каналы дискорда. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const lowVoice = "Ваше присутсвие в голосовом чате за последнюю неделю составило $percentage% от вашего игрового времени. "+
		"Если в течении недели ситуация не изменится, вас исключат из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const lowGame = "Ваш онлайн в игре составил $gameOnline. Если в течении недели ваш онлайн не увеличится, вас исключат из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._"

	i = 0;
	var sending = function () {
		if (i < members.length) {
			var member = bot_msg.client.users.get(members[i].discordMemberId);
			try {
				var member_message_text = "SELECT TEXT";
				member.send(member_message_text);

				console.log("pm " + voice0[i].displayName);
				logging.log(bot_msg.client, "__Игроку <@" + members[i].discordMemberId + "> [" + members[i].displayName + "] отправлено сообщение:__\n" + member_message_text);
			} catch (e) {
				logging.log(bot_msg.client, "<@149245139389251584>\nИгрок <@" + members[i].discordMemberId + "> [" + members[i].displayName + "] отключил ЛС.");
			}
			i++;
			setTimeout(sending, 2000);
		}
	}
	sending();
}


//var iconv = require('iconv-lite');
// redundant
function OLD_database_stuff(channel, battleTag, sync) {

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
function OLD_CreateSync(channel, discord_id, membershipType, membershipId, LastSeenDisplayName) {
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