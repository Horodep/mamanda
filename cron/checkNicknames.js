import Discord from "discord.js";
import config from "../config.json";
import { AsyncCompareAndShowNicknames } from "../clan/checkAndShowNicknames.js";
import { CatchCronError } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        var channel = client.channels.cache.get(config.channels.flood);
        AsyncCompareAndShowNicknames(channel, true);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 5000);
    } catch (e) {
        CatchCronError(e, client);
    }
});