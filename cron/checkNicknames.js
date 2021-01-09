import Discord from "discord.js";
import config from "../config.json";
import { Nicknames } from "../clan.js";
import { CatchError, FetchDefaultCatchErrorChannel } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try{
        FetchDefaultCatchErrorChannel(client);
        var channel = client.channels.cache.get(config.channels.flood);
        Nicknames(channel, true);
        setTimeout(function(){
            client.destroy();
            process.exit();
        }, 5000);
    }catch(e){
        CatchError(e);
    }
});