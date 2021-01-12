import Discord from "discord.js";
import config from "../config.json";
import { ResetEnglish } from "../discordGuildMasterFeatures.js";
import { CatchError, FetchDefaultCatchErrorChannel } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        FetchDefaultCatchErrorChannel(client);
        const channel = client.channels.cache.get(config.channels.gamenews);
        ResetEnglish(channel);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 8000);
    } catch (e) {
        CatchError(e);
    }
});