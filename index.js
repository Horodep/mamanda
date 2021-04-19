// https://discordjs.guide/additional-info/changes-in-v12.html
import Discord from "discord.js";
import schedule from 'node-schedule';
import config from "./config.json";
// events
import { Message } from "./discordEvents/message.js";
import { MessageDelete } from "./discordEvents/messageDelete.js";
import { AsyncMessageReactionAdd } from "./discordEvents/messageReactionAdd.js";
import { AsyncMessageReactionRemove } from "./discordEvents/messageReactionRemove.js";
// core
import { CommandManager } from "./commandManager.js";
import { ManifestManager } from "./manifest.js";
import { FetchDefaultCatchErrorChannel, CatchCronError } from "./catcherror.js";
import { AsyncRefreshAuthToken } from "./http/httpCore.js";
// cron
import { ClearRaidList } from "./discordFeatures/raid/raid.js";
import { SetRolesToEveryMember } from "./clan/clan.js";
import { AsyncShowClanTime } from "./clan/showClanTime.js";
import { PublishDailyMessage } from "./discordFeatures/forum.js";
import { AsyncCompareAndShowNicknames } from "./clan/checkAndShowNicknames.js";
import { AsyncDrawXur } from "./drawing/drawXur.js";
import { AsyncShowResetEnglish } from "./discordFeatures/show/showResetEnglish.js";
import { AsyncDrawEververse } from "./drawing/drawEververse.js";
import { CheckVyakbansLimitations } from "./discordFeatures/vyakManager.js";

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
client.login(config.credentials.discordApiKey);
CommandManager.Init();
ManifestManager.Refresh();
AsyncRefreshAuthToken();

client.on("ready", () => {
	client.user.setActivity("на Летописца 9 из 10", { type: 'WATCHING' });
	FetchDefaultCatchErrorChannel(client);
	console.log("Discord client connected!");
});
client.on("guildMemberAdd", (member) => console.log("NEW MEMBER " + member.displayName));
client.on("message", (_message) => Message(_message));
client.on("messageDelete", (message) => MessageDelete(message));
client.on("messageReactionAdd", (reaction, user) => AsyncMessageReactionAdd(reaction, user));
client.on("messageReactionRemove", (reaction, user) => AsyncMessageReactionRemove(reaction, user));

schedule.scheduleJob('1 */4 * * *', () => SaveRun(() => ManifestManager.Refresh()));
schedule.scheduleJob('0 3 * * *', () => SaveRun(() => ClearRaidList(client)));
schedule.scheduleJob('0 4 * * *', () => SaveRun(() => SetRolesToEveryMember(client.guilds.cache.get(config.guilds.main))));
schedule.scheduleJob('0 8 * * *', () => SaveRun(async () => await AsyncShowClanTime(GetChannel(config.channels.clankick), 7, 'pm')));
schedule.scheduleJob('0 20 * * *', () => SaveRun(() => PublishDailyMessage(client)));
schedule.scheduleJob('0 21 * * *', () => SaveRun(async () => await AsyncCompareAndShowNicknames(GetChannel(config.channels.flood), true)));
schedule.scheduleJob('1 20 * * 5', () => SaveRun(async () => await AsyncDrawXur(GetChannel(config.channels.gamenews))));
schedule.scheduleJob('0 22 * * 2', () => SaveRun(async () => await AsyncShowResetEnglish(GetChannel(config.channels.gamenews))));
schedule.scheduleJob('2 20 * * 2', () => SaveRun(async () => await AsyncDrawEververse(GetChannel(config.channels.gamenews))));
schedule.scheduleJob('* * * * *', () => SaveRun(() => CheckVyakbansLimitations(client)));

function GetChannel(id) {
	return client.channels.cache.get(id);
}

async function SaveRun(callback) {
	try {
		await callback();
	} catch (e) {
		CatchCronError(e, client);
	}
};