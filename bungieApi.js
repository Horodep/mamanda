import { AsyncRequestWithPromise } from "./httpCore.js";
import config from "./config.json";

export async function AsyncGetGlobalAlerts() {
	return (await AsyncRequestWithPromise('GET', `https://www.bungie.net/Platform/GlobalAlerts/`));
}

export async function AsyncGetClanMembers(clanId) {
	var result = await AsyncRequestWithPromise('GET', `https://www.bungie.net/Platform/GroupV2/${clanId}/Members/`);
	return result?.Response?.results;
}

async function AsyncGetMemberData(membershipType, membershipId, componentsArray) {
	var components = componentsArray.join(",");
	var result = await AsyncRequestWithPromise('GET',
		`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`);
	return result?.Response;
}

export async function AsyncGetCoreMemberData(membershipType, membershipId) {
	return (await AsyncGetMemberData(membershipType, membershipId, ['Records', 'Collectibles']));
}

export async function AsyncGetFullMemberData(membershipType, membershipId) {
	return (await AsyncGetMemberData(membershipType, membershipId, ['Profiles', 'Characters', 'CharacterProgressions', 'PresentationNodes', 'Records', 'Collectibles']));
}

export async function AsyncGetProfileData(membershipType, membershipId) {
	return (await AsyncGetMemberData(membershipType, membershipId, ['Profiles']))?.profile;
}

export async function AsyncGetActivitiesFromApi(membershipType, membershipId, characterId, page, mode) {
	try /*need to check if needed*/{
		mode = mode ? mode : "None";
		var result = await AsyncRequestWithPromise('GET',
			`https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=250&page=${page}`);
		return result;
	} catch (responce) {
		console.error("Rejected: " + responce.ErrorStatus + " id: " + membershipId);
		return responce;
	}
}

export async function AsyncGetVendor(vendorId, componentsArray){
	var cred = config.credentials.game_defaults;
	var components = componentsArray.join(",");
	return (await AsyncRequestWithPromise('GET', 
		`https://www.bungie.net/Platform/Destiny2/${cred.membershipType}/Profile/${cred.membershipId}/Character/${cred.characterId}/Vendors/${vendorId}/?components=${components}`,
		true /*auth*/));
}

export async function AsyncGetXurData(){
	return await AsyncGetVendor(2190858386, [402,304]);
}