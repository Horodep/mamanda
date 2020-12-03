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

    get percentage() {
        return (this.#gameOnline == 0) ? 0 : Math.floor(100 * this.#voiceOnline / this.#gameOnline);
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

    GetTimeLine(seconds) {
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        return hours + ":" + minutes;
    }
    GetMemberTimeString() {
        if (this.access == false)
            return "**" + this.displayName + "** :: профиль закрыт; в войсе — " + GetTimeLine(this.#voiceOnline);
        else
            return "**" + this.displayName + "** :: " +
                this.GetTimeLine(this.#voiceOnline) + " / " +
                this.GetTimeLine(this.#gameOnline) + " = " + this.percentage + "%";

        //var percentage = member.getPercentage();
        //if (percentage < 100) {percentage = "0"+percentage;}
        //if (percentage < 10)  {percentage = "0"+percentage;}
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
            .addField("Game online", this.access == false ? "Classified" : (this.GetTimeLine(this.#gameOnline) +
                " [(детальная статистика)](https://chrisfried.github.io/secret-scrublandeux/guardian/" + this.membershipType + "/" + this.membershipId + ")"))

        embed.addField("Voice online", createLine(message, finmember, "solotime") + "```" + (text.length > 0 ? text : " ") + "```")
        if (text1.length > 0) embed.addField("Voice online", "```" + (text1.length > 0 ? text1 : " ") + "```")
        if (text2.length > 0) embed.addField("Voice online", "```" + (text2.length > 0 ? text2 : " ") + "```")
        embed
            .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
            .setTimestamp()
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

    //var clanVoiceSummary = await GetClanVoiceSummary(7);
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

function FormMemberTimeMessage() {
    if (doFull) {
        text = "";
        text1 = "";
        text2 = "";
        results.forEach(function (line) {
            addon =
                new Date(line.datetime.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                new Date(line.next_datetime_fixed.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                line.td.substring(0, 5) + "\n";

            if ((text + addon).length > 1010) {
                if ((text1 + addon).length > 1010) {
                    text2 += addon;
                } else {
                    text1 += addon;
                }
            } else {
                text += addon;
            }
        });
    }
}
