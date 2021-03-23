import { AsyncGetMemberByDiscordName } from "../clan.js";
import { AsyncGetClanVoiceSummary, AsyncGetMemberDetailedVoice } from "../../http/sql.js";
import { AsyncGetAllActivities } from "./getActivities.js";
import { GetDiscordMemberByMention, ClanMember } from "./clanMember.js";


export async function AsyncGetClanMemberOnlineTime(message, days, discordMention, isDetailed) {
    var discordName = discordMention == null
        ? message.member.displayName
        : GetDiscordMemberByMention(message.guild, discordMention).displayName;

    var apiMember = await AsyncGetMemberByDiscordName(discordName);
    var clanMember = new ClanMember(apiMember);
    await clanMember.FetchCharacterIds();
    clanMember.FetchDiscordMember(message.guild);

    var clanVoiceSummary = await AsyncGetClanVoiceSummary(days);
    clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]);

    var activities = await AsyncGetAllActivities(clanMember, days);
    activities.forEach(a => clanMember.AddToGameOnline(a.values.timePlayedSeconds.basic.value));

    if (isDetailed) {
        var detailedVoiceResults = await AsyncGetMemberDetailedVoice(days, clanMember.discordMemberId);
        var lines = clanMember.FormLinesForDetailedVoice(detailedVoiceResults);
        message.channel.send(clanMember.GetMemberTimeEmbed(lines));
    }
    else
        message.channel.send(clanMember.GetMemberTimeString());
}
