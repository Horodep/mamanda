import { makeRequestWithPromise } from "./httpCore.js";
import config from "./config.json";

export async function GetGlobalAlerts() {
	return (await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/GlobalAlerts/`));
}

export async function GetClanMembers(clanId) {
	var result = await makeRequestWithPromise('GET', `https://www.bungie.net/Platform/GroupV2/${clanId}/Members/`);
	return result?.Response?.results;
}

async function GetMemberData(membershipType, membershipId, componentsArray) {
	var components = componentsArray.join(",");
	var result = await makeRequestWithPromise('GET',
		`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`);
	return result?.Response;
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
		return result;
	} catch (responce) {
		console.error("Rejected: " + responce.ErrorStatus + " id: " + membershipId);
		return responce;
	}
}

export async function GetVendor(vendorId, componentsArray){
	var cred = config.credentials.game_defaults;
	var components = componentsArray.join(",");
	return (await makeRequestWithPromise('GET', 
		`https://www.bungie.net/Platform/Destiny2/${cred.membershipType}/Profile/${cred.membershipId}/Character/${cred.characterId}/Vendors/${vendorId}/?components=${components}`,
		true /*auth*/));
}

export async function GetXur(){
	return await GetVendor(2190858386, [402,304]);
}