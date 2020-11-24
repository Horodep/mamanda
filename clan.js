import Discord from "discord.js";
import config from "./config.json";

import HttpCore from "./httpCore.json";

function getClanMembers(clanId){
	return HttpCore.httpRequest(`https://www.bungie.net/Platform/GroupV2/${clanId}/Members/`);
}

function getFullMemberData(membershipType, membershipId){
	return HttpCore.httpRequest(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=Profiles,Characters,CharacterProgressions,PresentationNodes,Records,Collectibles`)
}

function getAllMembers(){
	var members = [];
	Array.prototype.push.apply(members, getClanMembers(config.clans.clan1));
	Array.prototype.push.apply(members, getClanMembers(config.clans.clan2));
	return members;
}

export function FindMemberByFullName(fullName) {
	var members = getAllMembers();
	members.forEach(function(member) { 
		if(fullName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") || 
		   fullName == member.destinyUserInfo.LastSeenDisplayName){
			return member;
		}
	});
}

export function ClanTime(message) {
	var members = getAllMembers();
	//.....
}
export function bruteforce (){
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