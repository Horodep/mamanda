import Discord from "discord.js";
import config from "../config.json";
import { ManifestManager } from "../manifest.js";
import { CatchCronError } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        ManifestManager.Refresh();
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 10000);
    } catch (e) {
        CatchCronError(e, client);
    }
});