import Discord from "discord.js";
import config from "../config.json";
import { AsyncShowClanTime } from "../clan.js";
import { CatchError, FetchDefaultCatchErrorChannel } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try /*need to check if needed*/{
        FetchDefaultCatchErrorChannel(client);
        var channel = client.channels.cache.get(config.channels.clankick);
        AsyncShowClanTime(channel, 7, 'pm');
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 180000);
    } catch (e) {
        CatchError(e);
    }
});