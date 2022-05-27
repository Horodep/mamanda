import config from "../../config.json" assert {type: "json"};
import { MessageEmbed } from "discord.js";
import { ManifestManager } from "../../manifest.js";

export function ShowLegendarySectors(channel) {
	var today = new Date();
	today.setHours(today.getHours() + 7);
	var counter = Math.floor((today) / (24 * 3600 * 1000));

	var emojiServer = channel.client.guilds.cache.get(config.guilds.emojis);
	var emojiCache = emojiServer.emojis.cache;

	var legend = ManifestManager.GetActivityData(SECTOR_ROTATION_MAP[counter % 11][0], true);
	var master = ManifestManager.GetActivityData(SECTOR_ROTATION_MAP[counter % 11][1], true);
	var legendReward = ManifestManager.GetItemData(SECTOR_REWARD_ROTATION_MAP[counter % 4][0], true).displayProperties;
	var masterReward = ManifestManager.GetItemData(SECTOR_REWARD_ROTATION_MAP[counter % 4][1], true).displayProperties;
	var legendDestination = ManifestManager.GetDestinationData(legend.destinationHash)?.displayProperties?.name;
	var masterDestination = ManifestManager.GetDestinationData(master.destinationHash)?.displayProperties?.name;
	var legendRewardText = legendReward.name.replace("IF SOLO - ", "Solo: ").replace(" (Rare)", "");
	var legendDescription = ParceDescritpion(legend, emojiCache);
	var masterDescription = ParceDescritpion(master, emojiCache);
	ManifestManager.CleanCache();

	var embed = new MessageEmbed()
		.setAuthor(legend.displayProperties.name.split(":")[0] + " (" + legendDestination + ")")
		.setDescription(legendRewardText)
		//.setFooter("Grind them for all that fancy brand new magnificent exotic stuff!")
		.setFooter("В начале сезона информация может не соответствовать действительности!")
		.setColor(0x00AE86)
		.setTimestamp()
		.addField("Legend (1550)", legendDescription, true)
		.addField("Master (1580)", masterDescription, true);
	channel.send(embed);
}

function ParceDescritpion(data, emojiCache) {
	var array = data.displayProperties.description.split("\n\n");

	var burn = array.find(s => s.startsWith("Burn"))?.split(":")[1] + "**+50%** ";
	var champions = array.find(s => s.includes("Champions: "))?.split(":")[1].replace(",", "/ ");
	var modifiers = array.find(s => s.includes("Modifier"))?.split(":")[1];
	var modifiers_master = array.find(s => s.startsWith("Master Modifier"))?.split(":")[1];
	var shields = array.find(s => s.startsWith("Shields"))?.split(":")[1];

	return "" +
		"> Burn: " + FillWithEmoji(burn, emojiCache) + "\n" +
		"> Champions: " + FillWithEmoji(champions, emojiCache) + "\n" +
		"> Modifiers: " + modifiers + (modifiers_master ? ", " + modifiers_master : "") + "\n" +
		"> Sheilds: " + FillWithEmoji(shields, emojiCache);
}

function FillWithEmoji(line, emojiCache) {
	if (!line) return "not known";
	return line
		.replace(/\[[\w-]*\]/g, "")
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

const SECTORS = {
	THE_QUARRY:             {  LEGEND: 3253890607,     MASTER: 3253890600	},
	SCAVENGERS_DEN:         {  LEGEND: 1905792149,     MASTER: 1905792146   },
	EXCAVATION_SITE_XII:    {  LEGEND: 548616650,      MASTER: 548616653    },
	EXODUS_GARDEN_2A:       {  LEGEND: 2936791996,     MASTER: 2936791995   },
	VELES_LABYRINTH:        {  LEGEND: 3094493720,     MASTER: 3094493727   },
	THE_EMPTY_TANK:         {  LEGEND: 2019961998,     MASTER: 2019961993   },
	K1_LOGISTICS:           {  LEGEND: 567131512,      MASTER: 567131519    },
	K1_COMMUNION:           {  LEGEND: 2829206727,     MASTER: 2829206720   },
	K1_CREW_QUARTERS:       {  LEGEND: 184186581,      MASTER: 184186578    },
	K1_REVELATION:          {  LEGEND: 3911969233,     MASTER: 3911969238   },
	CONCEALED_VOID:         {  LEGEND: 912873277,      MASTER: 912873274    },
	BUNKER_E15:             {  LEGEND: 1648125541,     MASTER: 1648125538   },
	PERDITION:              {  LEGEND: 1070981430,     MASTER: 1070981425   },
	BAY_OF_DROWNED_WISHES:  {  LEGEND: 660710127,      MASTER: 660710120    },
	CHAMBER_OF_STARLIGHT:   {  LEGEND: 4206916275,     MASTER: 4206916276   },
	APHELIONS_REST:         {  LEGEND: 1898610132,     MASTER: 1898610131   },
	METAMORPHOSIS:          {  LEGEND: 3678847129,     MASTER: 3678847134   },
	EXTRACTION:             {  LEGEND: 145221019,      MASTER: 145221020    },
	SEPULCHER:              {  LEGEND: 480864726,      MASTER: 480864721    },
	TOWER:                             1502633527
};

const SECTOR_ROTATION_MAP = {
	10: [SECTORS.K1_REVELATION.LEGEND,         SECTORS.K1_REVELATION.MASTER],
	0:  [SECTORS.K1_CREW_QUARTERS.LEGEND,      SECTORS.K1_CREW_QUARTERS.MASTER],
	1:  [SECTORS.K1_LOGISTICS.LEGEND,          SECTORS.K1_LOGISTICS.MASTER],
	2:  [SECTORS.METAMORPHOSIS.LEGEND,         SECTORS.METAMORPHOSIS.MASTER],
	3:  [SECTORS.SEPULCHER.LEGEND,    	       SECTORS.SEPULCHER.MASTER],
	4:  [SECTORS.EXTRACTION.LEGEND,            SECTORS.EXTRACTION.MASTER],
	5:  [SECTORS.VELES_LABYRINTH.LEGEND,       SECTORS.VELES_LABYRINTH.MASTER],
	6:  [SECTORS.EXODUS_GARDEN_2A.LEGEND,      SECTORS.EXODUS_GARDEN_2A.MASTER],
	7:  [SECTORS.APHELIONS_REST.LEGEND,        SECTORS.APHELIONS_REST.MASTER],
	8:  [SECTORS.BAY_OF_DROWNED_WISHES.LEGEND, SECTORS.BAY_OF_DROWNED_WISHES.MASTER],
	9:  [SECTORS.CHAMBER_OF_STARLIGHT.LEGEND,  SECTORS.CHAMBER_OF_STARLIGHT.MASTER]
}; 

const SECTOR_REWARD_ROTATION_MAP = {
	0: [2850782006, 247000308],
	1: [1572351682, 256080248],
	2: [176055472, 2686128774],
	3: [1387420892, 2679019194]
};