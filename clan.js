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
	Array.prototype.push.apply(members, getClanMembers(config.clans[0]));
	Array.prototype.push.apply(members, getClanMembers(config.clans[1]));
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

export function ExecuteForEveryMember(timeout, callback) {
	var members = getAllMembers();
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
		message.channel.send(member);
	});
}
