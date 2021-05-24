class CharacterDetails {
	titan = { light: 0, id: null };
	hunter = { light: 0, id: null };
	warlock = { light: 0, id: null };

	CharactersExist() {
		return this.titan.light > 0 || this.hunter.light > 0 || this.warlock.light > 0;
	}
	GetBestCharacterId() {
		if (this.titan.light > this.hunter.light && this.titan.light > this.warlock.light) {
			return this.titan.id;
		} else if (this.hunter.light > this.warlock.light) {
			return this.hunter.id;
		} else {
			return this.warlock.id;
		}
	}
}

function GetDataAndHandleErrors(textprefix, callback) {
	try {
		return callback();
	} catch {
		return {
			state: false,
			error: true,
			text: textprefix + ": not defined"
		};
	}
}

export function GetNodeData(data, nodeHash, textprefix) {
	return GetNodeDataFiltered(data, nodeHash, [], [], textprefix);
}

function SafeGetValue(data, dataArrayName, hash, valueName) {
	return data["profile"+dataArrayName][hash]
		? data["profile"+dataArrayName][hash][valueName]
		: data["character"+dataArrayName][hash][valueName];
}

export function GetNodeDataFiltered(data, nodeHash, additionalRecords, ignoredRecords, textprefix, minCompletionValue) {
	return GetDataAndHandleErrors(textprefix, () => {
		var progress = SafeGetValue(data, "Nodes", nodeHash, "progressValue");
		var completion = SafeGetValue(data, "Nodes", nodeHash, "completionValue");

		for (var recordHash of additionalRecords) {
			completion++;
			progress += SafeGetValue(data, "Records", recordHash, "state") % 2;
		}

		for (var recordHash of ignoredRecords) {
			completion--;
			progress -= SafeGetValue(data, "Records", recordHash, "state") % 2;
		}

		if (minCompletionValue > completion) completion = minCompletionValue;

		return {
			state: progress == completion,
			text: textprefix + ": " + progress + "/" + completion
		};
	});
}

export function GetBestNode(records, recordHashArray, textprefix) {
	var data;
	for (let recordHash of recordHashArray) {
		data = GetNodeData(records, recordHash, textprefix);
		if (data.state) return data;
	}
	return data;
}

export function GetProgressionData(progressions, hash, neededValue, textprefix) {
	return GetDataAndHandleErrors(textprefix, () => ({
		state: progressions[hash].currentProgress >= neededValue,
		text: (textprefix == "" ? "" : textprefix + ": ") +
			progressions[hash].currentProgress + "/" + neededValue
	}));
}

export function GetProfileRecordsCore(response, dataname, neededValue, textprefix) {
	return GetDataAndHandleErrors(textprefix, () => ({
		state: response.profileRecords.data[dataname] >= neededValue,
		text: (textprefix == "" ? "" : textprefix + ": ") +
			response.profileRecords.data[dataname] + "/" + (neededValue / 1000) + "k"
	}));
}

export function GetCollectiblesData(collectibles, hash, textprefix) {
	return GetDataAndHandleErrors(textprefix, () => ({
		state: collectibles.profileCollectibles[hash]?.state % 2 == 0 ||
			   collectibles.characterCollectibles[hash]?.state % 2 == 0,
		text: textprefix
	}));
}

export function GetDayOneData(collectibles) {
	return GetDataAndHandleErrors("Day 1: ", () => {
		var completed = [];
		var raids = [
			{ id: 2172413746, name: "ХЧ"},
			{ id: 2273453972, name: "СГК"},
			{ id: 3938759711, name: "СС"},
			{ id: 3171386140, name: "КС"},
			{ id: 1171206947, name: "ПЖ"}
		];
		for (var raid of raids) {
			if (collectibles.profileCollectibles[raid.id]?.state % 2 == 0) completed.push(raid.name);
			if (collectibles.characterCollectibles[raid.id]?.state % 2 == 0) completed.push(raid.name);
		}

		return {
			state: completed.length > 0,
			text: "Day 1: " + completed.join(", ")
		}
	});
}

export function GetIfPersonOfInterest(data) {
	return GetDataAndHandleErrors("", () => ({
		state: ((data.profileRecords[3448775736].state == 67 ? 1 : 0) +
			(data.profileRecords[3804486505].state == 67 ? 1 : 0) +
			(data.profileRecords[3185876102].state == 67 ? 1 : 0)) < 3,
		text: ""
	}));
}

export function FetchCharacterData(response) {
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

export function FetchData(response) {
	var characterPresentationNodes = [];
	var characterRecords = [];
	var characterProgressions = [];
	var characterCollectibles = [];
	for (var characterID in response.characterPresentationNodes.data)
		characterPresentationNodes.push([characterID, response.characterPresentationNodes.data[characterID]]);
	for (var characterID in response.characterRecords.data)
		characterRecords.push([characterID, response.characterRecords.data[characterID]]);
	for (var characterID in response.characterProgressions.data)
		characterProgressions.push([characterID, response.characterProgressions.data[characterID]]);
	for (var characterID in response.characterProgressions.data)
		characterCollectibles.push([characterID, response.characterCollectibles.data[characterID]]);

	var records = {
		profileRecords: response.profileRecords.data.records,
		characterRecords: characterRecords[0][1].nodes,
		profileNodes: response.profilePresentationNodes.data.nodes,
		characterNodes: characterPresentationNodes[0][1].nodes
	};
	var progressions = characterProgressions[0][1].progressions;
	var collectibles = {
		profileCollectibles: response.profileCollectibles.data.collectibles,
		characterCollectibles: characterCollectibles[0][1].collectibles
	};
	return { records, collectibles, progressions };
}