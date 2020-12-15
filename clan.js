import { MessageEmbed } from "discord.js";
import config from "./config.json";
import { GetClanMembers } from "./bungieApi.js";
import { GetShowAndSetRoles } from "./roles.js";
import { ClanMember, GetAllActivities } from "./clanMember.js";
import { GetClanVoiceSummary } from "./sql.js";
import { GetFullDiscordClanMemberList } from "./discordCommunityFeatures.js";
import { SendPrivateMessagesToArray } from "./sendMessage.js";

async function GetFullGameClanMemberList() {
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
	var members = await GetFullGameClanMemberList();
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
	var members = await GetFullGameClanMemberList();
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

export async function Nicknames(channel, isReminder) {
	var gameMembers = await GetFullGameClanMemberList();
	var discordMembers = GetFullDiscordClanMemberList(channel.guild);

	var discordList = [];
	var discordPsnList = [];
	var gameList = [];
	
	discordMembers.forEach(function (discordMember) {
		if (gameMembers.filter(gameMember => discordMember.displayName.startsWith(gameMember.destinyUserInfo.LastSeenDisplayName)).length == 0) {
			if (discordMember.roles.cache.find(role => role.name === "PSN")) {
				discordPsnList.push("<@" + discordMember.id + ">");
			} else {
				discordList.push("<@" + discordMember.id + ">");
			}
		}
	});
	
	gameMembers.forEach(function (gameMember) {
		if (discordMembers.filter(discordMember => discordMember.displayName.startsWith(gameMember.destinyUserInfo.LastSeenDisplayName)).length == 0) {
			gameList.push(gameMember.destinyUserInfo.LastSeenDisplayName);
		}
	});

	const embed = new MessageEmbed()
		.setAuthor("Aurora")
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp()
	if (discordPsnList.length > 0)
		embed.addField("PSN: " + discordPsnList.length + "/" + discordMembers.length, discordPsnList.join("\n"), true)
	if (discordList.length > 0)
		embed.addField("Дискорд: " + discordList.length + "/" + discordMembers.length, discordList.join("\n"), true)
	if (gameList.length > 0)
		embed.addField("Игра: " + gameList.length + "/" + gameMembers.length, gameList.join("\n"), true)

	if (!isReminder) channel.send({ embed });
	else if (discordList.length > 0) 
		channel.send(discordList.join(", ") + "\n\nОбращаю ваше внимание, что ваш никнейм в дискорде не соответствует игровому.");
}

export async function ClanTime(channel, days, modificators) {
	var clanMembers = [];
	var clanVoiceSummary = await GetClanVoiceSummary(days);
	var iterator = 0;
	channel.send(new MessageEmbed()).then((msg) => {
		ExecuteForEveryMember(500, async function (member, i, members) {
			var clanMember = new ClanMember(member);
			await clanMember.FetchCharacterIds();
			clanMember.FetchDiscordMember(channel.guild);
			clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]);
			var activities = await GetAllActivities(clanMember, days);
			activities.forEach(a => clanMember.AddToGameOnline(a.values.timePlayedSeconds.basic.value))

			clanMembers.push(clanMember);
			iterator++;

			if (iterator % 20 == 0 || iterator == members.length) {
				msg.edit(FormClanTimeEmbed(clanMembers, modificators + (iterator == members.length ? ' final' : '')));
			}
			if (iterator == members.length && modificators.includes("pm")) {
				SendPrivateMessagesToArray(GetArrayOfMembersWithPMText(clanMembers));
			}
		});
	});
}

function FormClanTimeEmbed(clanMembers, modificators) {
	var guild = clanMembers[0].discordMember.guild;
	var embed = new MessageEmbed()
		.setAuthor("Clankick " + (modificators.includes("final") ? "" : clanMembers.length))
		.setColor(0x00AE86)
		.setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
		.setTimestamp()

	var { lowGame, lowVoice, zeroGame, zeroVoice, goodNewbie, isAway, noData, weForgotToKik, discordNotFound } = filterClanMembersData(clanMembers);

	var isFull = modificators.includes("full");

	//       embed | field title | array | pattern | separator | show_if_empty | semicolumn | condition
	addField(embed, "Меньше 5 часов", lowGame, null, "\n", false, false, isFull);
	addField(embed, "Меньше 15%", lowVoice, null, "\n", false, false, true);
	addField(embed, "0 в игре [в войсе]", zeroGame, "`$voice$role`$tag", "\n", false, true, true);
	addField(embed, "0 в войсе [в игре]", zeroVoice, "`$game$role`$tag", "\n", false, true, true);
	addField(embed, "Очернить стража", goodNewbie, null, "\n", true, false, true);
	addField(embed, "В отпуске [в игре]", isAway, "$tag ($game)", "\n", false, true, isFull);
	addField(embed, "Профиль закрыт [в войсе]", noData, "`$voice$role`$tag", "\n", false, true, isFull);
	addField(embed, '\u200B', [], "", "", true, false, true)
	addField(embed, "Недокикнуты [в игре]", weForgotToKik, "$name ($game)", "\n", false, true, true);
	addField(embed, "Неверный ник [в игре]", discordNotFound, "$name ($game)", "\n", false, true, true);

	if (!modificators.includes("final")) return embed;

	var discordMembers = GetFullDiscordClanMemberList(guild);
	var left = "";
	discordMembers.forEach(function (member) {
		if (clanMembers.filter(m => member.displayName.startsWith(m.displayName)).length == 0) {
			left += "<@" + member.user.id + ">\n"
		}
	});
	if (left.length > 0) embed.addField("Неверный ник [в дискорде]", left, true)

	return embed;
}

function GetArrayOfMembersWithPMText(clanMembers) {
	const zeroGameMessage = "Последнюю неделю вы не заходили в игру. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const zeroVoiceMessage = "Последнюю неделю вы не заходили в голосовые каналы дискорда. Если в ближайшие дни ситуация не изменится, вы будете исключены из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const lowVoiceMessage = "Ваше присутсвие в голосовом чате за последнюю неделю составило $percent от вашего игрового времени. " +
		"Если в течении недели ситуация не изменится, вас исключат из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";
	const lowGameMessage = "Ваш онлайн в игре составил $game. Если в течении недели ваш онлайн не увеличится, вас исключат из клана.\n" +
		"_Это автоматическое сообщение, пожалуйста, не отвечайте на него._";

	var textedMembers = [];
	var { lowGame, lowVoice, zeroGame, zeroVoice } = filterClanMembersData(clanMembers);
	//lowGame.forEach(member => {textedMembers.push({discordMember: member.discordMember, text: createLine(member, lowGameMessage)});})
	lowVoice.forEach(member => {textedMembers.push({discordMember: member.discordMember, text: createLine(member, lowVoiceMessage)});})
	zeroVoice.forEach(member => {textedMembers.push({discordMember: member.discordMember, text: createLine(member, zeroVoiceMessage)});})
	zeroGame.forEach(member => {textedMembers.push({discordMember: member.discordMember, text: createLine(member, zeroGameMessage)});})
	return textedMembers;
}

function filterClanMembersData(clanMembers) {
	var filteredMembers = clanMembers;

	var discordNotFound = filteredMembers.filter(m => !m.discordMemberExists).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !discordNotFound.includes(e));

	var filteredMembers = filteredMembers.filter(m => m.joined >= 7);

	var isAway = filteredMembers.filter(m => m.HasDiscordRole(config.roles.afk)).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !isAway.includes(e));

	var noData = filteredMembers.filter(m => !m.access && !m.HasDiscordRole(config.roles.newbie)).sort(byVoiceTime);
	filteredMembers = filteredMembers.filter(e => !noData.includes(e));

	var zeroGame = filteredMembers.filter(m => m.isZeroGame).sort(byVoiceTime);
	filteredMembers = filteredMembers.filter(e => !zeroGame.includes(e));

	var zeroVoice = filteredMembers.filter(m => m.isZeroVoice).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !zeroVoice.includes(e));

	var lowVoice = filteredMembers.filter(m => m.percentage < 15).sort(byPercentage);
	filteredMembers = filteredMembers.filter(e => !lowVoice.includes(e));

	var lowGame = filteredMembers.filter(m => m.isLowGame).sort(byGameTime);
	filteredMembers = filteredMembers.filter(e => !lowGame.includes(e));

	var goodNewbie = filteredMembers.filter(m => m.HasDiscordRole(config.roles.newbie) && m.joined >= 10).sort(byJoinDate);
	filteredMembers = filteredMembers.filter(e => !goodNewbie.includes(e));

	var weForgotToKik = filteredMembers.filter(m => m.HasDiscordRole(config.roles.guest));

	function byGameTime(a, b) { return a.gameOnline < b.gameOnline ? 1 : a.gameOnline > b.gameOnline ? -1 : 0; }
	function byVoiceTime(a, b) { return a.voiceOnline < b.voiceOnline ? 1 : a.voiceOnline > b.voiceOnline ? -1 : 0; }
	function byJoinDate(a, b) { return a.joined < b.joined ? 1 : a.joined > b.joined ? -1 : 0; }
	function byPercentage(a, b) { return a.percentage < b.percentage ? 1 : a.percentage > b.percentage ? -1 : 0; }

	return { lowGame, lowVoice, zeroGame, zeroVoice, goodNewbie, isAway, noData, weForgotToKik, discordNotFound };
}

function addField(embed, embed_header, members, linePattern, separator, show_if_empty, semicolumn, show) {
	if (!show) return;
	if (members.length == 0 && !show_if_empty) return;
	if (members.map(m => createLine(m, linePattern)).join(separator).length > 1010) {
		embed.addField(embed_header, members.filter((_, i) => i < members.length / 2).map(m => createLine(m, linePattern)).join(separator), semicolumn);
		embed.addField(embed_header, members.filter((_, i) => i >= members.length / 2).map(m => createLine(m, linePattern)).join(separator).semicolumn);
	} else {
		var prefix = show_if_empty ? '\u200B' : "";
		embed.addField(embed_header, prefix + members.map(m => createLine(m, linePattern)).join(separator), semicolumn);
	}
}

function createLine(clanMember, pattern) {
	if (!pattern) pattern = "`$percent $voice $game $role`$tag";
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