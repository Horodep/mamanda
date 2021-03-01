import Discord from "discord.js";
import config from "../config.json";
import { AsyncDrawEververse } from "../drawing/drawEververse.js";
import { CatchCronError } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", async () => {
    try {
        const channel = client.channels.cache.get(config.channels.gamenews);
        await AsyncDrawEververse(channel);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 30000);
    } catch (e) {
        CatchCronError(e, client);
    }
});