import Discord from "discord.js";
import config from "../config.json";
import { PublishDailyMessage } from "../discordGuildMasterFeatures.js"
import { CatchCronError } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        PublishDailyMessage(client);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 1500);
    } catch (e) {
        CatchCronError(e, client);
    }
});