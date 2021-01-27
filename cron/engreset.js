import Discord from "discord.js";
import config from "../config.json";
import { AsyncShowResetEnglish } from "../discordGuildMasterFeatures.js";
import { CatchCronError } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        const channel = client.channels.cache.get(config.channels.gamenews);
        AsyncShowResetEnglish(channel);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 8000);
    } catch (e) {
        CatchCronError(e, client);
    }
});