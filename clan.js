import Discord from "discord.js";
import config from "./config.json";
import {GetClanMembers} from "./bungieApi.js";

function GetAllMembers(){
	var members = [];
	Array.prototype.push.apply(members, GetClanMembers(config.clans[0]));
	Array.prototype.push.apply(members, GetClanMembers(config.clans[1]));
	return members;
}

export function FindMemberByFullName(fullName) {
	var members = GetAllMembers();
	members.forEach(function(member) { 
		if(fullName.startsWith(member.destinyUserInfo.LastSeenDisplayName + " ") || 
		   fullName == member.destinyUserInfo.LastSeenDisplayName){
			return member;
		}
	});
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
