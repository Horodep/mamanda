import Discord from "discord.js";
import config from "./config.json";
import {GetClanMembers} from "./bungieApi.js";

async function GetAllMembers(){
	var members = [];
	Array.prototype.push.apply(members, await GetClanMembers(config.clans[0].id));
	Array.prototype.push.apply(members, await GetClanMembers(config.clans[1].id));
	return members;
}

export async function FindMemberByFullName(fullName) {
	var members = await GetAllMembers();
	try{
		members.forEach(function(member) { 
			if(fullName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") || 
			fullName == member.destinyUserInfo.LastSeenDisplayName){
				throw member;
			}
		});
	}catch (member){
		return member;
	}
}

export function ExecuteForEveryMember(timeout, callback) {
	var members = GetAllMembers();
	var i = 0;
	var iteration = function(){
		if(i < members.length){
			callback(members[i]);
			setTimeout(iteration, timeout); 
		}
	}
	iteration();
}

export function ClanTime(message) {
	ExecuteForEveryMember(1000, function(member){
		// do stuff
	});
}

//var iconv = require('iconv-lite');

// redundant
export function database_stuff (channel, battleTag, sync) {

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