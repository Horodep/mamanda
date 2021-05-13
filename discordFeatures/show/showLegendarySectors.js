import config from "../../config.json";
import { MessageEmbed } from "discord.js";
import { ManifestManager } from "../../manifest.js";

export function ShowLegendarySectors(channel) {
	var today = new Date();
	today.setHours(today.getHours() + 7);
	var counter = Math.floor((today) / (24 * 3600 * 1000));

	var emojiServer = channel.client.guilds.cache.get(config.guilds.emojis);
	var emojiCache = emojiServer.emojis.cache;

	var legend = ManifestManager.GetActivityData(SECTOR_ROTATION_MAP[counter % 9][0], true);
	var master = ManifestManager.GetActivityData(SECTOR_ROTATION_MAP[counter % 9][1], true);
	var legendReward = ManifestManager.GetItemData(SECTOR_REWARD_ROTATION_MAP[counter % 4][0], true).displayProperties;
	var masterReward = ManifestManager.GetItemData(SECTOR_REWARD_ROTATION_MAP[counter % 4][1], true).displayProperties;
	var legendDestination = ManifestManager.GetDestinationData(legend.destinationHash)?.displayProperties?.name;
	var masterDestination = ManifestManager.GetDestinationData(master.destinationHash)?.displayProperties?.name;
	var legendDescription =
		legendReward.name.replace("IF SOLO - ", "Solo: ").replace(" (Rare)", "") + '\n' +
		ParceDescritpion(legend, emojiCache);
	var masterDescription =
		masterReward.name.replace("IF SOLO - ", "Solo: ").replace(" (Common)", "") + '\n' +
		ParceDescritpion(master, emojiCache);
	ManifestManager.CleanCache();

	var embed = new MessageEmbed()
		.setAuthor("Legendary sectors")
		.setColor(0x00AE86)
		.setTimestamp()
		.setDescription("Ротация изменилась, порядок некоторых секторов еще не известен.")
		.addField("Legend (1310)\n" + legend.displayProperties.name.split(":")[0] + " (" + legendDestination + ")", legendDescription, true)
		.addField("Master (1340)\n" + master.displayProperties.name.split(":")[0] + " (" + masterDestination + ")", masterDescription, true);
	channel.send(embed);
}

function ParceDescritpion(data, emojiCache) {
	var array = data.displayProperties.description.split("\n\n");

	var burn = array.find(s => s.startsWith("Burn"))?.split(" ")[1].replace("++", "**+50%** ");
	var enemies = array.find(s => s.includes("Champions: "))?.split(" ")[0];
	var champions = array.find(s => s.includes("Champions: "))?.split(":")[1].replace(",", "/ ");
	var modifiers = array.find(s => s.includes("Modifier"))?.split(":")[1];
	var modifiers_master = array.find(s => s.startsWith("Master Modifier"))?.split(":")[1];
	var shields = array.find(s => s.startsWith("Shields"))?.split(":")[1] ?? SHIELDS_MAP[data.hash];

	return "" +
		"> Burn: " + FillWithEmoji(burn, emojiCache) + "\n" +
		"> Enemies: " + enemies + " / " + FillWithEmoji(champions, emojiCache) + "\n" +
		"> Modifiers: " + modifiers + (modifiers_master ? ", " + modifiers_master : "") + "\n" +
		"> Sheilds: " + FillWithEmoji(shields, emojiCache);
}

function FillWithEmoji(line, emojiCache) {
	if (!line) return "not known";
	return line
		.replace("[", "")
		.replace("]", "")
		.replace("", `${emojiCache.find(e => e.name == 'arc')} `)
		.replace("", `${emojiCache.find(e => e.name == 'void')} `)
		.replace("", `${emojiCache.find(e => e.name == 'solar')} `)
		.replace("", `${emojiCache.find(e => e.name == 'stasis')} `)
		.replace("Arc", `${emojiCache.find(e => e.name == 'arc')} `)
		.replace("Void", `${emojiCache.find(e => e.name == 'void')} `)
		.replace("Solar", `${emojiCache.find(e => e.name == 'solar')} `)
		.replace("Stasis", `${emojiCache.find(e => e.name == 'stasis')} `)
		.replace("Barrier", `${emojiCache.find(e => e.name == 'barrier')} `)
		.replace("Overload", `${emojiCache.find(e => e.name == 'overload')} `)
		.replace("Unstoppable", `${emojiCache.find(e => e.name == 'unstoppable')} `);
}

// TODO@Horodep: #56 sector rotation is outdated
const SECTOR_ROTATION_MAP = {    // legend                master
	1: [912873277, 3911969238],  // Concealed Void        K1 Revelation
	2: [1648125541, 912873274],  // Bunker E15            Concealed Void
	3: [1070981430, 1648125538], // Perdition             Bunker E15
	4: [3253890607, 1070981425], // The Quarry            Perdition
	5: [1502633527, 3253890600], // ?????                 The Quarry
	6: [1502633527, 1502633527], // ?????                 ?????
	7: [1502633527, 1502633527], // ?????                 ?????
	8: [2936791996, 1502633527], // Exodus Garden 2A      ?????
	9: [3094493720, 2936791995], // Veles Labyrinth       Exodus Garden 2A
	10: [567131512, 3094493727], // K1 Logistics          Veles Labyrinth
	11: [2829206727, 567131519], // K1 Communion          K1 Logistics
	12: [184186581, 2829206720], // K1 Crew Quarters      K1 Communion
	0: [3911969233, 184186578]   // K1 Revelation         K1 Crew Quarters
};
//                            legend            master
// The Quarry:                3253890607        3253890600
// Excavation Site XII:       548616650         548616653
// The Empty Tank:            2019961998        2019961993
// Scavenger's Den:           1905792149        1905792146

const SECTOR_REWARD_ROTATION_MAP = {
	0: [1387420892, 2686128774],
	1: [2850782006, 2679019194],
	2: [1572351682, 247000308],
	3: [176055472, 256080248]
};

const SHIELDS_MAP = {
	912873277: "Void, Solar, Arc",   // Legend: Concealed Void
	1648125541: "Void, Solar",       // Legend: Bunker E15
	1070981430: "Void, Arc",         // Legend: Perdition
	2936791996: "Void",              // Legend: Exodus Garden 2A
	3094493720: "Solar, Arc",        // Legend: Veles Labyrinth
	567131512: "Solar, Arc",         // Legend: K1 Logistics,
	2829206727: "Void, Solar",       // Legend: K1 Communion
	184186581: "Solar",              // Legend: K1 Crew Quarters
	3911969233: "Arc",               // Legend: K1 Revelation

	912873274: "Void, Solar",        // Master: Concealed Void
	1648125538: "Void",              // Master: Bunker E15
	1070981425: "Void, Arc",         // Master: Perdition
	2936791995: "Void",              // Master: Exodus Garden 2A
	3094493727: "Solar, Arc - ???",  // Master: Veles Labyrinth
	567131519: "Solar, Arc",         // Master: K1 Logistics,
	2829206720: "Solar",             // Master: K1 Communion
	184186578: "Solar",              // Master: K1 Crew Quarters
	3911969238: "Arc",               // Master: K1 Revelation
};