import { makeRequestWithPromise } from "./httpCore.js";

export async function GetGlobalAlerts() {
	try {
		var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/GlobalAlerts/`);
		return result;
	} catch {
		console.error("Rejected: " + result);
	}
}

export async function GetClanMembers(clanId) {
	try {
		var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/GroupV2/${clanId}/Members/`);
		return result.Response.results;
	} catch {
		console.error("Rejected: " + result);
	}
}

async function GetMemberData(membershipType, membershipId, componentsArray) {
	try {
		var components = componentsArray.join(",");
		var result = await makeRequestWithPromise('GET',
			`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`);
		return result.Response;
	} catch {
		console.error("Rejected: " + result);
	}
}

export async function GetCoreMemberData(membershipType, membershipId) {
	return (await GetMemberData(membershipType, membershipId, ['Records', 'Collectibles']));
}

export async function GetFullMemberData(membershipType, membershipId) {
	return (await GetMemberData(membershipType, membershipId, ['Profiles', 'Characters', 'CharacterProgressions', 'PresentationNodes', 'Records', 'Collectibles']));
}

export async function GetProfileData(membershipType, membershipId) {
	return (await GetMemberData(membershipType, membershipId, ['Profiles']))?.profile;
}

export async function GetActivitiesFromApi(membershipType, membershipId, characterId, page, mode) {
	try {
		mode = mode ? mode : "None";
		var result = await makeRequestWithPromise('GET',
			`https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=250&page=${page}`);
		return result.Response;
	} catch {
		console.error("Rejected: " + result + " id: " + membershipId);
		return result;
	}
}
