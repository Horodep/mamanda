import { AsyncRequestWithPromise } from "./httpCore.js";
import config from "../config.json";

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
	try {
		mode = mode ? mode : "None";
		var response = await AsyncRequestWithPromise('GET',
			`https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=250&page=${page}`);
		return response;
	} catch (e) {
		console.error("Rejected: " + e.response.ErrorStatus + " id: " + membershipId);
		return e.response;
	}
}

export async function AsyncGetVendor(vendorId, componentsArray, customCharacterId) {
	var cred = config.credentials.game_defaults;
	var components = componentsArray.join(",");
	var characterId = customCharacterId ?? config.credentials.game_defaults.characterId;
	return (await AsyncRequestWithPromise('GET',
		`https://www.bungie.net/Platform/Destiny2/${cred.membershipType}/Profile/${cred.membershipId}/Character/${characterId}/Vendors/${vendorId}/?components=${components}`,
		true /*auth*/));
}

export async function AsyncGetXurData() {
	return await AsyncGetVendor(2190858386, [402, 304]);
}

export async function AsyncGetEververseData(customCharacterId) {
	return await AsyncGetVendor(2190858386, [402, 304], customCharacterId);
}

export async function AsyncGetManifestLinks() {
	return (await AsyncRequestWithPromise('GET', `https://www.bungie.net/Platform/Destiny2/Manifest/`));
}