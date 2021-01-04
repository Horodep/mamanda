class CharacterDetails{
	titan = {light: 0, id: null};
	hunter = {light: 0, id: null};
	warlock = {light: 0, id: null};
	
	CharactersExist(){
		return this.titan.light > 0 || this.hunter.light > 0 || this.warlock.light > 0;
	}
	GetBestCharacterId(){
		if (this.titan.light > this.hunter.light && this.titan.light > this.warlock.light){
			return this.titan.id;
		}else if (this.hunter.light > this.warlock.light){
			return this.hunter.id;
		}else{
			return this.warlock.id;
		}
	}
}

export function get_character_details(response) {
	var charactersDetails = new CharacterDetails();
	var characterIds = response.profile.data.characterIds;
	var characters = response.characters.data;
	characterIds.forEach(function (characterId) {
		switch (characters[characterId].classType) {
			case 0:
				charactersDetails.titan.light = characters[characterId].light;
				charactersDetails.titan.id = characterId;
				break;
			case 1:
				charactersDetails.hunter.light = characters[characterId].light;
				charactersDetails.hunter.id = characterId;
				break;
			case 2:
				charactersDetails.warlock.light = characters[characterId].light;
				charactersDetails.warlock.id = characterId;
				break;
		}
	});
	return charactersDetails;
}

export function get_node_data_with_extra_records(jsondata, recordHash, recordHashArray, textprefix) {
	try {
		var progress = jsondata.profilePresentationNodes.data.nodes[recordHash].progressValue;
		var completion = jsondata.profilePresentationNodes.data.nodes[recordHash].completionValue;
		for (let recordHash of recordHashArray) {
			completion++;
			progress += (jsondata.profileRecords.data.records[recordHash].state == 67 ? 1 : 0);
		}
		return {
			state: progress == completion,
			text: textprefix + ": " + progress + "/" + completion
		};
	} catch (e) {
		CatchError(e);
		return {
			state: false,
			text: textprefix + ": not defined"
		};
	}
}

export function get_node_data(jsondata, recordHash, textprefix) {
	try {
		return {
			state: jsondata.profilePresentationNodes.data.nodes[recordHash].progressValue >=
				jsondata.profilePresentationNodes.data.nodes[recordHash].completionValue,
			text: textprefix + ": " +
				jsondata.profilePresentationNodes.data.nodes[recordHash].progressValue + "/" +
				jsondata.profilePresentationNodes.data.nodes[recordHash].completionValue
		};
	} catch (e) {
		CatchError(e);
		return {
			state: false,
			text: textprefix + ": not defined"
		};
	}
}

export function get_character_node_data(characterPresentationNodes, recordHash, textprefix) {
	try {
		return {
			state: characterPresentationNodes[0][1].nodes[recordHash].progressValue >=
				characterPresentationNodes[0][1].nodes[recordHash].completionValue,
			text: textprefix + ": " +
				characterPresentationNodes[0][1].nodes[recordHash].progressValue + "/" +
				characterPresentationNodes[0][1].nodes[recordHash].completionValue
		};
	} catch (e) {
		CatchError(e);
		return {
			state: false,
			text: textprefix + ": not defined"
		};
	}
}

export function get_character_progression_data(characterProgressions, recordHash, neededValue, textprefix) {
	try {
		return {
			state: characterProgressions[0][1].progressions[recordHash].currentProgress >= neededValue,
			text: (textprefix == "" ? "" : textprefix + ": ") +
				characterProgressions[0][1].progressions[recordHash].currentProgress + "/" + neededValue
		};
	} catch (e) {
		CatchError(e);
		return {
			state: false,
			text: textprefix + ": not defined"
		};
	}
}

export function get_any_of_data(characterPresentationNodes, recordHashArray, textprefix) {
	var data;
	for (let recordHash of recordHashArray) {
		data = get_character_node_data(characterPresentationNodes, recordHash, textprefix);
		if (data.state)
			return data;
	}
	return data;
}

export function get_profile_records(jsondata, dataname, neededValue, textprefix) {
	try {
		return {
			state: jsondata.profileRecords.data[dataname] >= neededValue,
			text: (textprefix == "" ? "" : textprefix + ": ") +
				jsondata.profileRecords.data[dataname] + "/" + (neededValue / 1000) + "k"
		};
	} catch (e) {
		CatchError(e);
		return {
			state: false,
			text: textprefix + ": not defined"
		};
	}
}

export function get_season_triumphs(jsondata, characterPresentationNodes, nodeHash, ignoredRecordHashArray, textprefix) {
	try {
		var ignored = 0;
		for (let ignoredRecordHash of ignoredRecordHashArray) {
			ignored = ignored + ((jsondata.profileRecords.data.records[ignoredRecordHash].state == 67) ? 0 : 1);
		}
		return {
			state: characterPresentationNodes[0][1].nodes[nodeHash].currentProgress ==
				characterPresentationNodes[0][1].nodes[nodeHash].completionValue - ignored
				&& characterPresentationNodes[0][1].nodes[nodeHash].completionValue > 0,
			text: (textprefix == "" ? "" : textprefix + ": ") +
				characterPresentationNodes[0][1].nodes[nodeHash].progressValue + "/" +
				(characterPresentationNodes[0][1].nodes[nodeHash].completionValue - ignored)
		};
	} catch (e) {
		CatchError(e);
		return {
			state: false,
			text: textprefix + ": not defined"
		};
	}
}

export function get_day_one(jsondata, characterCollectibles) {
	try {
		return {
			state: jsondata.profileCollectibles.data.collectibles[2273453972].state % 2 != 1 ||
				characterCollectibles[0][1].collectibles[3938759711].state % 2 != 1 ||
				jsondata.profileCollectibles.data.collectibles[3171386140].state % 2 != 1 ||
				jsondata.profileCollectibles.data.collectibles[1171206947].state % 2 != 1,
			text: "Day1: " +
				(jsondata.profileCollectibles.data.collectibles[2273453972].state % 2 != 1 ? "СГК " : "") +
				(characterCollectibles[0][1].collectibles[3938759711].state % 2 != 1 ? "СС " : "") +
				(jsondata.profileCollectibles.data.collectibles[3171386140].state % 2 != 1 ? "КС " : "") +
				(jsondata.profileCollectibles.data.collectibles[1171206947].state % 2 != 1 ? "ПЖ " : "")
		};
	} catch (e) {
		CatchError(e);
		return {
			state: false,
			text: "Day1: not defined"
		};
	}
}

export function get_all_nodes(jsondata, recordHashArray, textprefix) {
	var counter = 0;
	for (let recordHash of recordHashArray) {
		counter = counter + (jsondata.profileRecords.data.records[recordHash].state == 67 ? 1 : 0);
	}
	return {
		state: counter == recordHashArray.length,
		text: textprefix + ": " + counter + "/" + recordHashArray.length
	};
}

export function get_poi(jsondata) {
	try {
		return {
			state: ((jsondata.profileRecords.data.records[3448775736].state == 67 ? 1 : 0) +
				(jsondata.profileRecords.data.records[3804486505].state == 67 ? 1 : 0) +
				(jsondata.profileRecords.data.records[3185876102].state == 67 ? 1 : 0)) < 3,
			text: ""
		};
	} catch (e) {
		CatchError(e);
		return { state: false, text: "" };
	}
}
