import Discord from "discord.js";
import config from "../config.json";
import { CheckVyakbansLimitations } from "../discordFeatures/vyakManager.js";
import { CatchCronError } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        CheckVyakbansLimitations(client);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 5000);
    } catch (e) {
        CatchCronError(e, client);
    }
});