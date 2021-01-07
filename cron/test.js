import Discord from "discord.js";
import config from "../config.json";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);

client.on("ready", () => {
	var channel = client.channels.cache.get("760479409886330891");
    channel.send("test");
    setTimeout(function(){
        client.destroy();
        process.exit();
    }, 150);
});