import { makeRequestWithPromise } from "./httpCore.js";

export async function GetClanMembers(clanId) {
	try {
		var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/GroupV2/${clanId}/Members/`);
		return result.Response.results;
	} catch {
		console.log("Rejected: " + result);
	}
}

async function GetMemberData(membershipType, membershipId, componentsArray) {
	try {
		var components = componentsArray.join(",");
		var result = await makeRequestWithPromise('GET',
			`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`);
		return result.Response;
	} catch {
		console.log("Rejected: " + result);
	}
}

export async function GetCoreMemberData(membershipType, membershipId) {
	return GetMemberData(membershipType, membershipId, ['Records', 'Collectibles']);
}

export async function GetFullMemberData(membershipType, membershipId) {
	return GetMemberData(membershipType, membershipId, ['Profiles', 'Characters', 'CharacterProgressions', 'PresentationNodes', 'Records', 'Collectibles']);
}

export async function GetProfileData(membershipType, membershipId) {
	return GetMemberData(membershipType, membershipId, ['Profiles'])?.profile;
}

export async function GetActivitiesFromApi(membershipType, membershipId, characterId, page, mode) {
	try {
		mode = mode ? mode : "None";
		var result = await makeRequestWithPromise('GET',
			`https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=250&page=${page}`);
		//console.log(`Success! id: ${membershipId} char: ${characterId} page: ${page}`);
		return result.Response;
	} catch {
		console.log("Rejected: " + result + " id: " + membershipId);
		return result;
	}
}
