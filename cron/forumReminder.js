import Discord from "discord.js";
import config from "../config.json";
import { PublishDailyMessage } from "../discordGuildMasterFeatures.js"

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
	PublishDailyMessage(client);
});