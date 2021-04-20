import schedule from 'node-schedule';
import config from "./config.json";
import { CatchShedulerError } from "./catcherror.js";

import { ManifestManager } from "./manifest.js";
import { ClearRaidList } from "./discordFeatures/raid/raid.js";
import { SetRolesToEveryMember } from "./clan/clan.js";
import { AsyncShowClanTime } from "./clan/showClanTime.js";
import { PublishDailyMessage } from "./discordFeatures/forum.js";
import { AsyncCompareAndShowNicknames } from "./clan/checkAndShowNicknames.js";
import { AsyncDrawXur } from "./drawing/drawXur.js";
import { AsyncShowResetEnglish } from "./discordFeatures/show/showResetEnglish.js";
import { AsyncDrawEververse } from "./drawing/drawEververse.js";
import { CheckVyakbansLimitations } from "./discordFeatures/vyakManager.js";

export class Sheduler {
	static client;

	static Init(cl) {
		this.client = cl;
		schedule.scheduleJob('1 */4 * * *', () => this.SaveRun(() => ManifestManager.Refresh()));
		schedule.scheduleJob('0 3 * * *', () => this.SaveRun(() => ClearRaidList(this.client)));
		schedule.scheduleJob('0 4 * * *', () => this.SaveRun(() => SetRolesToEveryMember(GetGuild(config.guilds.main))));
		schedule.scheduleJob('0 8 * * *', () => this.SaveRun(async () => await AsyncShowClanTime(GetChannel(config.channels.clankick), 7, 'pm')));
		schedule.scheduleJob('0 20 * * *', () => this.SaveRun(() => PublishDailyMessage(this.client)));
		schedule.scheduleJob('0 21 * * *', () => this.SaveRun(async () => await AsyncCompareAndShowNicknames(GetChannel(config.channels.flood), true)));
		schedule.scheduleJob('1 20 * * 5', () => this.SaveRun(async () => await AsyncDrawXur(GetChannel(config.channels.gamenews))));
		schedule.scheduleJob('0 22 * * 2', () => this.SaveRun(async () => await AsyncShowResetEnglish(GetChannel(config.channels.gamenews))));
		schedule.scheduleJob('2 20 * * 2', () => this.SaveRun(async () => await AsyncDrawEververse(GetChannel(config.channels.gamenews))));
		schedule.scheduleJob('* * * * *', () => this.SaveRun(() => CheckVyakbansLimitations(this.client)));
	}

	static async SaveRun(callback) {
		try {
			await callback();
		} catch (e) {
			CatchShedulerError(e, this.client);
		}
	}

	static GetChannel(id) {
		return this.client.channels.cache.get(id);
	}

	static GetGuild(id) {
		return this.client.guilds.cache.get(id);
	}
}