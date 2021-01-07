import Discord from "discord.js";
import config from "../config.json";
import { PublishDailyMessage } from "../discordGuildMasterFeatures.js"
import { FetchDefaultCatchErrorChannel } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
	FetchDefaultCatchErrorChannel(client);
    PublishDailyMessage(client);
    setTimeout(function(){
        client.destroy();
        process.exit();
    }, 150);
});