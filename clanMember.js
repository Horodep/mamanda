import { MessageEmbed } from "discord.js";
import { GetActivitiesFromApi, GetProfileData } from "./bungieApi.js";
import { GetMemberByDiscordName } from "./clan.js";
import { GetClanVoiceSummary } from "./sql.js"
/*
#crossSaveOverride;
#applicableMembershipTypes;
#isPublic;
#membershipType;
#membershipId;
#displayName;*/
export class ClanMember {
    #destinyUserInfo;
    #clanId;
    discordMember;
    #characterIds;

    #voiceOnline = 0;
    #gameOnline = 0;
    access = true;

    constructor(member) {
        this.#destinyUserInfo = member.destinyUserInfo ?? member.userInfo;
        this.#clanId = member.groupId;
    }

    get membershipType() {
        return this.#destinyUserInfo.membershipType;
    }
    get membershipId() {
        return this.#destinyUserInfo.membershipId;
    }
    get displayName() {
        if (this.#destinyUserInfo.lastSeenDisplayName != null) {
            return this.#destinyUserInfo.lastSeenDisplayName;
        }
        return this.#destinyUserInfo.displayName;
    }
    get characterIds() {
        return this.#characterIds;
    }

    get clanId() {
        return this.#clanId;
    }

    get discordMemberExists() {
        return this.discordMember != null;
    }
    get discordMemberId() {
        return this.discordMember?.id;
    }
    get discordTag() {
        return "<?" + this.discordMember?.id + "?>";
    }
    get joined(){
        return Math.round((Date.now() - this.discordMember.joinedTimestamp) / (1000 * 60 * 60 * 24))
    }
    HasDiscordRole(roleId) {
        return this.discordMember.roles.cache.find(role => role.id == roleId) != null;
    }

    get voiceOnline(){
        return this.#voiceOnline;
    }
    get gameOnline(){
        return this.#gameOnline;
    }
    get percentage() {
        return (this.#gameOnline == 0) ? 0 : Math.floor(100 * this.#voiceOnline / this.#gameOnline);
    }
    get isLowGame() {
        return this.#gameOnline < 7*60*60;
    }
    get isZeroGame() {
        return this.#gameOnline == 0;
    }
    get isZeroVoice() {
        return this.#voiceOnline == 0;
    }

    async FetchCharacterIds() {
        var profileWithCharacters = await GetProfileData(this.#destinyUserInfo.membershipType, this.#destinyUserInfo.membershipId);
        this.#characterIds = profileWithCharacters.data.characterIds;
    }

    SetDiscordMember(_discordMember) {
        this.discordMember = _discordMember;
    }
    FetchDiscordMember(guild) {
        this.discordMember =
            guild.members.cache.find(member => (member.displayName.startsWith(this.displayName + " ")
                || member.displayName == this.displayName));
    }

    AddToVoiceOnline(deltaTime) {
        this.#voiceOnline += deltaTime;
    }
    AddToGameOnline(deltaTime) {
        this.#gameOnline += deltaTime;
    }

    GetPercentageLine() {
        var percentage = this.percentage();
        if (percentage < 100) { percentage = "0" + percentage; }
        if (percentage < 10) { percentage = "0" + percentage; }
        return percentage + "%";
    }
    GetTimeLine(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        return hours + ":" + minutes;
    }
    GetGameTimeLine() {
        return this.access ? this.GetTimeLine(this.#gameOnline) : "--:--";
    }
    GetVoiceTimeLine() {
        return this.GetTimeLine(this.#voiceOnline);
    }
    GetMemberTimeString() {
        if (this.access == false)
            return "**" + this.displayName + "** :: профиль закрыт; в войсе — " + this.GetVoiceTimeLine();
        else
            return "**" + this.displayName + "** :: " +
                this.GetVoiceTimeLine() + " / " +
                this.GetGameTimeLine() + " = " + this.percentage + "%";
    }
    FormLinesForDetailedVoice(results) {
        var lines = []
        results.forEach((row) => {
            lines.push(new Date(row.datetime.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                new Date(row.next_datetime_fixed.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                row.td.substring(0, 5));
        });
        return lines;
    }
    GetMemberTimeEmbed(detailedLines) {
        const embed = new MessageEmbed()
            .setAuthor(this.displayName + " — " + this.percentage + "%")
            .setColor(0x00AE86)
            .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
            .setTimestamp()
            .addField("Game online", this.access == false ? "Classified" : (this.GetTimeLine(this.#gameOnline) +
                " [(детальная статистика)](https://chrisfried.github.io/secret-scrublandeux/guardian/" + this.membershipType + "/" + this.membershipId + ")"))
        var body = "";
        detailedLines.forEach(line => {
            if ((body + line) > 1010) {
                embed.addField("Voice online", "```" + body + "```");
                body = line;
            } else {
                body += "\n" + line;
            }

        });
        embed.addField("Voice online", "```" + body + "```");
        return embed;
    }
}

export async function GetClanMemberOnlineTime(message, days, discordMention) {
    console.log(new Date());
    var discordName = message.member.displayName;
    if (discordMention != null) {
        var discordId = discordMention.replace(/\D/g, '');
        var discordMember = message.guild.members.cache.find(member => member.user.id == discordId);
        if (discordMember == null) {
            channel.send('Дискорд профиль не найден.');
            return;
        }
        discordName = discordMember.displayName;
    }

    var apiMember = await GetMemberByDiscordName(discordName);
    var clanMember = new ClanMember(apiMember);
    await clanMember.FetchCharacterIds();
    clanMember.FetchDiscordMember(message.guild);

    //var clanVoiceSummary = await GetClanVoiceSummary(days);
    //clanMember.AddToVoiceOnline(clanVoiceSummary[clanMember.discordMemberId]); // don't work

    var activities = await GetAllActivities(clanMember, days);
    activities.forEach(a => clanMember.AddToGameOnline(a.values.timePlayedSeconds.basic.value))

    message.channel.send(clanMember.GetMemberTimeString());
    console.log(new Date());
}

async function GetAllActivities(clanMember, days) {
    var deltaDate = new Date();
    deltaDate.setDate(deltaDate.getDate() - days);

    var activities = [];
    var promises = clanMember.characterIds.map(async characterId => {
        Array.prototype.push.apply(activities, await GetCharacterActivities(clanMember, characterId, 0, 'None', deltaDate));
    });
    await Promise.all(promises);
    return activities;
}

async function GetCharacterActivities(clanMember, characterId, page, mode, deltaDate) {
    var filteredActivities = [];
    var activities = await GetActivitiesFromApi(clanMember.membershipType, clanMember.membershipId, characterId, page, mode);
    if (typeof (activities) == 'undefined') {
        clanMember.access = false;
        return [];
    }
    var isLastPage = false;
    activities.forEach(function (activity) {
        if (deltaDate < new Date(activity.period)) {
            filteredActivities.push(activity);
        } else {
            isLastPage = true;
        }
    });
    if (!isLastPage) Array.prototype.push.apply(filteredActivities, await GetCharacterActivities(clanMember, characterId, ++page, mode, deltaDate));
    return filteredActivities;
}
