import Discord from "discord.js";
import config from "../config.json";
import { ManifestManager } from "../manifest.js";
import { CatchError, FetchDefaultCatchErrorChannel } from "../catcherror.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
    try{
        FetchDefaultCatchErrorChannel(client);
        ManifestManager.Refresh();
        setTimeout(function(){
            client.destroy();
            process.exit();
        }, 10000);
    }catch(e){
        CatchError(e);
    }
});