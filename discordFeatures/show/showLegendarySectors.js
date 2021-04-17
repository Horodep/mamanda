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
	var legendModifiers = legend.modifiers.map(m => m.activityModifierHash)
		.map(hash => `${emojiCache.find(e => e.name == hash)} ` + ManifestManager.GetActivityModifierData(hash, true)?.displayProperties?.name);
	var masterModifiers = master.modifiers.map(m => m.activityModifierHash)
		.map(hash => `${emojiCache.find(e => e.name == hash)} ` + ManifestManager.GetActivityModifierData(hash, true)?.displayProperties?.name);
	ManifestManager.CleanCache();

	var embed = new MessageEmbed()
		.setAuthor("Legendary sectors")
		.setColor(0x00AE86)
		.setTimestamp()
		.addField(legend.displayProperties.name, legendReward.name + '\n\n' + legendModifiers.join('\n'), true)
		.addField(master.displayProperties.name.replace("Legend", "Master"), masterReward.name + '\n\n' + masterModifiers.join('\n'), true);
	channel.send(embed);
}

// ordered legend, master
const SECTOR_ROTATION_MAP = {    // legend
	0: [912873277, 3911969238],  // Concealed Void
	1: [1648125541, 912873274],  // Bunker E15
	2: [1070981430, 1648125538], // Perdition
	3: [2936791996, 1070981425], // Exodus Garden 2A
	4: [3094493720, 2936791995], // Veles Labyrinth
	5: [567131512, 3094493727],  // K1 Logistics,
	6: [2829206727, 567131519],  // K1 Communion
	7: [184186581, 2829206720],  // K1 Crew Quarters
	8: [3911969233, 184186578]   // K1 Revelation
};

const SECTOR_REWARD_ROTATION_MAP = {
	0: [1572351682, 247000308],
	1: [176055472, 256080248],
	2: [1387420892, 2686128774],
	3: [2850782006, 2679019194]
};