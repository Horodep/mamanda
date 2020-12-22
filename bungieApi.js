import { makeRequestWithPromise } from "./httpCore.js";

export async function GetClanMembers(clanId){
	try{
		var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/GroupV2/${clanId}/Members/`);		
		return result.Response.results;
	}catch{
		console.log("Rejected: " + result);
	}
}

export async function GetCoreMemberData(membershipType, membershipId){
	try{
		var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=Records,Collectibles`);
		return result.Response;
	}catch{
		console.log("Rejected: " + result);
	}
}

export async function GetFullMemberData(membershipType, membershipId){
	try{
		var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=Profiles,Characters,CharacterProgressions,PresentationNodes,Records,Collectibles`);
		return result.Response;
	}catch{
		console.log("Rejected: " + result);
	}
}

export async function GetProfileData(membershipType, membershipId){
	try{
		var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=Profiles`);
		return result.Response.profile;
	}catch{
		console.log("Rejected: " + result);
	}
}

export async function GetActivitiesFromApi(membershipType, membershipId, characterId, page, mode){
	try{
		mode = mode ? mode : "None";
		var result = await makeRequestWithPromise('GET', 
			`https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=250&page=${page}`);
		//console.log(`Success! id: ${membershipId} char: ${characterId} page: ${page}`);
		return result.Response;
	}catch{
		console.log("Rejected: " + result + " id: " + membershipId);
		return result;
	}
}
