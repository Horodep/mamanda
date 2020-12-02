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

export async function FindMemberByFullName(fullName) {
	var members = await GetAllMembers();
	try {
		members.forEach(function (member) {
			if (fullName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") ||
				fullName == member.destinyUserInfo.LastSeenDisplayName) {
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
		clanMember.LookForDiscordMember(channel.guild);
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
