import { httpRequest } from "./httpCore.js";

export function GetClanMembers(clanId){
	return httpRequest(`https://www.bungie.net/Platform/GroupV2/${clanId}/Members/`);
}

export function GetFullMemberData(membershipType, membershipId){
	return httpRequest(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=Profiles,Characters,CharacterProgressions,PresentationNodes,Records,Collectibles`)
}

export function get_character_light(jsondata){
    var charactersLight = {
		titan: -1,
		hunter: -1,
		warlock: -1
    };

    var characterIds = jsondata.Response.profile.data.characterIds;
	var characters = jsondata.Response.characters.data;
	characterIds.forEach(function(characterId){
		switch(characters[characterId].classType){
			case 0:
				charactersLight.titan = characters[characterId].light;
				break;
			case 1:
				charactersLight.hunter = characters[characterId].light;
				break;
			case 2:
				charactersLight.warlock = characters[characterId].light;
				break;
		}
    });
    return charactersLight;
}

export function get_node_data(jsondata, recordHash, textprefix){
	try{
		return{
			state: 
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].progressValue >= 
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].completionValue,
			text:
				textprefix + ": " + 
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].progressValue + "/" +
				jsondata.Response.profilePresentationNodes.data.nodes[recordHash].completionValue
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}

export function get_character_node_data(characterPresentationNodes, recordHash, textprefix){
	try{
		return{
			state: 
				characterPresentationNodes[0][1].nodes[recordHash].progressValue >= 
				characterPresentationNodes[0][1].nodes[recordHash].completionValue,
			text:
				textprefix + ": " + 
				characterPresentationNodes[0][1].nodes[recordHash].progressValue + "/" +
				characterPresentationNodes[0][1].nodes[recordHash].completionValue
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}

export function get_character_progression_data(characterProgressions, recordHash, neededValue, textprefix){
	try{
		return{
			state: 
				characterProgressions[0][1].progressions[recordHash].currentProgress >= neededValue,
			text:
				(textprefix == "" ? "" : textprefix + ": " ) + 
				characterProgressions[0][1].progressions[recordHash].currentProgress + "/" + neededValue
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}

export function get_any_of_data(characterPresentationNodes, recordHashArray, textprefix){
	var data;
	for (recordHash of recordHashArray){
		data = get_character_node_data(characterPresentationNodes, recordHash, textprefix);
		if (data.state) return data;
	}
	return data;
}

export function get_profile_records(jsondata, dataname, neededValue, textprefix){
	try{
		return{
			state: 
				jsondata.Response.profileRecords.data[dataname] >= neededValue,
			text:
				(textprefix == "" ? "" : textprefix + ": " ) + 
				jsondata.Response.profileRecords.data[dataname] + "/" + (neededValue/1000) + "k"
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}

export function get_season_triumphs(jsondata, characterPresentationNodes, nodeHash, ignoredRecordHashArray, textprefix){
	try{
		var ignored = 0;
		for (ignoredRecordHash of ignoredRecordHashArray){
			ignored = ignored + ((jsondata.Response.profileRecords.data.records[ignoredRecordHash].state == 67) ? 0 : 1);
		}
		return{
			state: 
				characterPresentationNodes[0][1].nodes[nodeHash].currentProgress == 
				characterPresentationNodes[0][1].nodes[nodeHash].completionValue - ignored
				&& characterPresentationNodes[0][1].nodes[nodeHash].completionValue > 0,
			text:
				(textprefix == "" ? "" : textprefix + ": " ) + 
				characterPresentationNodes[0][1].nodes[nodeHash].progressValue + "/" + 
				(characterPresentationNodes[0][1].nodes[nodeHash].completionValue - ignored)
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: textprefix + ": not defined"
		}
	}
}

export function get_day_one(jsondata, characterCollectibles){
	try{
		return{
			state: 
				jsondata.Response.profileCollectibles.data.collectibles[2273453972].state%2 != 1 &&
				characterCollectibles[0][1].collectibles[3938759711].state%2 != 1 &&
				jsondata.Response.profileCollectibles.data.collectibles[3171386140].state%2 != 1 &&
				jsondata.Response.profileCollectibles.data.collectibles[1171206947].state%2 != 1,
			text: "Day1: " +
				(jsondata.Response.profileCollectibles.data.collectibles[2273453972].state%2 != 1 ? "СГК " : "") + 
				(characterCollectibles[0][1].collectibles[3938759711].state%2 != 1 ? "СС " : "") + 
				(jsondata.Response.profileCollectibles.data.collectibles[3171386140].state%2 != 1 ? "КС " : "") + 
				(jsondata.Response.profileCollectibles.data.collectibles[1171206947].state%2 != 1 ? "ПЖ " : "")
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{
			state: false,
			text: "Day1: not defined"
		}
	}
}

export function get_all_nodes(jsondata, recordHashArray, textprefix){
	var counter = 0;
	for (recordHash of recordHashArray){
		counter = counter + (jsondata.Response.profileRecords.data.records[recordHash].state == 67 ? 1 : 0);
	}
	return {
		state: 
			counter == recordHashArray.length,
		text: textprefix + ": " + counter + "/" + recordHashArray.length
	};
}

export function get_poi(jsondata){
	try{
		return{
			state: 
				((jsondata.Response.profileRecords.data.records[3448775736].state == 67 ? 1 : 0) + 
				(jsondata.Response.profileRecords.data.records[3804486505].state == 67 ? 1 : 0) + 
				(jsondata.Response.profileRecords.data.records[3185876102].state == 67 ? 1 : 0)) < 3,
			text: ""
		}
	}catch(e){	
		console.log('Error ' + e.name + ":" + e.message + "\n" + e.stack);
		return{	state: false, text: ""	}
	}
}