import Discord from "discord.js";
import config from "../config.json";
import { AsyncDrawXur } from "../drawing.js";
import { CatchError, FetchDefaultCatchErrorChannel } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try /*need to check if needed*/{
        FetchDefaultCatchErrorChannel(client);
        const channel = client.channels.cache.get(config.channels.gamenews);
        AsyncDrawXur(channel);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 18000);
    } catch (e) {
        CatchError(e);
    }
});