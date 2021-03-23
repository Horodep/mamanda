import { MessageEmbed } from "discord.js";
import { AsyncGetActivitiesFromApi, AsyncGetCoreMemberData, AsyncGetProfileData } from "../../http/bungieApi.js";
import { AsyncGetMemberByDiscordName } from "../clan.js";
import { AsyncGetClanVoiceSummary, AsyncGetMemberDetailedVoice } from "../../http/sql.js"
import config from "../../config.json";

//TODO@Horodep: #49 Refactor ClanMember ASAP
export class ClanMember {
    #destinyUserInfo;
    #clanId;
    discordMember;
    #characterIds;

    #voiceOnline = 0;
    #gameOnline = 0;
    access = true;

    #activeScore = 0;

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
        if (this.#destinyUserInfo.LastSeenDisplayName != null) {
            return this.#destinyUserInfo.LastSeenDisplayName;
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
        return "<@" + this.discordMember?.id + ">";
    }
    get joined() {
        return this.discordMember == null ? 0 :
            Math.floor((Date.now() - this.discordMember.joinedTimestamp) / (1000 * 60 * 60 * 24))
    }
    HasDiscordRole(roleId) {
        if (!this.discordMemberExists) return false;
        return this.discordMember.roles.cache.find(role => role.id == roleId) != null;
    }

    get voiceOnline() {
        return this.#voiceOnline;
    }
    get gameOnline() {
        return this.#gameOnline;
    }
    get percentage() {
        return (this.#gameOnline == 0) ? 0 : Math.floor(100 * this.#voiceOnline / this.#gameOnline);
    }
    get isLowGame() {
        return this.#gameOnline < 5 * 60 * 60;
    }
    get isZeroGame() {
        return this.#gameOnline == 0;
    }
    get isZeroVoice() {
        return this.#voiceOnline == 0;
    }
    get activeScore() {
        return this.#activeScore;
    }

    async GetRecordDataState(triumphId) {
        var coreData = await AsyncGetCoreMemberData(this.#destinyUserInfo.membershipType, this.#destinyUserInfo.membershipId);

        return coreData?.profileRecords?.data?.records[triumphId]?.state % 2 == 1;
    }

    async FetchCharacterIds() {
        var profileWithCharacters = await AsyncGetProfileData(this.#destinyUserInfo.membershipType, this.#destinyUserInfo.membershipId);
        this.#characterIds = profileWithCharacters.data.characterIds;
    }
    async FetchActiveScore() {
        var coreMemberData = await AsyncGetCoreMemberData(this.#destinyUserInfo.membershipType, this.#destinyUserInfo.membershipId);
        this.#activeScore = coreMemberData?.profileRecords?.data?.activeScore ?? 0;
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
        if (!deltaTime) return;
        var deltaSeconds = (((deltaTime.hours ?? 0) * 60) + (deltaTime.minutes ?? 0)) * 60 + (deltaTime.seconds ?? 0);
        this.#voiceOnline += deltaSeconds;
    }
    AddToGameOnline(deltaTime) {
        this.#gameOnline += deltaTime;
    }

    GetPercentageLine() {
        var percentage = this.percentage;
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
        results?.rows?.forEach((row) => {
            lines.push(new Date(row.datetime.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                new Date(row.next_datetime_fixed.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(5, 16) + "   " +
                PeriodValueToLine(row.period.hours) + ":" + PeriodValueToLine(row.period.minutes));
        });
        function PeriodValueToLine(value) {
            return value ? (value < 10 ? "0" + value : value) : "00";
        }
        return lines;
    }

    FillStringWithData(stringLine) {
        if (!stringLine) stringLine = "`$percent $voice $game $role`$tag";
        return stringLine
            .replace("$name", this.displayName)
            .replace("$tag", this.discordTag)
            .replace("$role", this.GetRoleMark())
            .replace("$game", this.GetGameTimeLine())
            .replace("$voice", this.GetVoiceTimeLine())
            .replace("$percent", this.GetPercentageLine())
    }

    GetRoleMark() {
        if (this.HasDiscordRole(config.roles.newbie)) return "📗" + this.joined + "d";
        if (this.HasDiscordRole(config.roles.guardians[0])) return "📘";
        if (this.HasDiscordRole(config.roles.guardians[1])) return "📒";
        if (this.HasDiscordRole(config.roles.guardians[2])) return "📙";
        if (this.HasDiscordRole(config.roles.guardians[3])) return "📕";
        if (this.HasDiscordRole(config.roles.guildmaster)) return "👑";
        if (this.HasDiscordRole(config.roles.afk)) return "💤";
        if (this.HasDiscordRole(config.roles.raidleader)) return "🎓";
        return "❌";
    }

    GetMemberTimeEmbed(detailedLines) {
        const embed = new MessageEmbed()
            .setAuthor(this.displayName + " — " + this.percentage + "%")
            .setColor(0x00AE86)
            .setFooter("Horobot", "https://cdn.discordapp.com/avatars/543342030768832524/7da47eaca948d9874b66fc5884ca2d00.png")
            .setTimestamp()
            .addField("Game online", this.access == false ? "Classified" : (this.GetTimeLine(this.#gameOnline) +
                " [(детальная статистика)](https://chrisfried.github.io/secret-scrublandeux/guardian/" + this.membershipType + "/" + this.membershipId + ")"))
        var body = this.GetTimeLine(this.#voiceOnline) + "```";
        detailedLines.forEach(line => {
            if ((body + line).length > 1010) {
                embed.addField("Voice online", body + "\u200B```");
                body = "```" + line;
            } else {
                body += "\n" + line;
            }

        });
        embed.addField("Voice online", body + "\u200B```");
        return embed;
    }
}

export function GetDiscordMemberByMention(guild, discordMention) {
    var discordId = discordMention.replace(/\D/g, '');
    var discordMember = guild.members.cache.find(member => member.user.id == discordId);
    if (discordMember == null) throw 'Дискорд профиль не найден.';
    console.log(discordMember.displayName);
    return discordMember;
}
