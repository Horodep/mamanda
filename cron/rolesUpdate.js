import Discord from "discord.js";
import config from "../config.json";
import { SetRolesToEveryMember } from "../clan/clan.js";
import { CatchCronError } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try {
        var guild = client.guilds.cache.get(config.guilds.main);
        SetRolesToEveryMember(guild);
        setTimeout(() => {
            client.destroy();
            process.exit();
        }, 1200000);
    } catch (e) {
        CatchCronError(e, client);
    }
});