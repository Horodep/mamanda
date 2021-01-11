import Discord from "discord.js";
import config from "../config.json";
import { ClearRaidList } from "../raid.js";
import { CatchError, FetchDefaultCatchErrorChannel } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        FetchDefaultCatchErrorChannel(client);
        ClearRaidList(client);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 18000);
    } catch (e) {
        CatchError(e);
    }
});